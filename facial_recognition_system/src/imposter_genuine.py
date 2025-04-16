import os
import numpy as np
import matplotlib.pyplot as plt
import torch  # Added missing import
from facenet_pytorch import MTCNN, InceptionResnetV1
from utils import load_known_faces

# Setup device and models
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(image_size=160, margin=0, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Path to the celebrity dataset - using absolute path
data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'score_testing')
print(f"Looking for data in: {data_dir}")

# Helper function to extract embeddings
def extract_embedding(image_path):
    from PIL import Image
    try:
        # Open the image and convert to RGB mode to handle images with alpha channels
        image = Image.open(image_path).convert('RGB')
    except Exception as e:
        print(f"Error loading {image_path}: {e}")
        return None
    face = mtcnn(image)
    if face is None:
        print(f"No face detected in {image_path}")
        return None
    face = face.unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = resnet(face)
    return embedding.cpu().numpy().flatten()

# Load embeddings for a specific identity
def load_embeddings_for_identity(identity, dataset_dir):
    identity_dir = os.path.join(dataset_dir, identity)
    embeddings = []
    if not os.path.isdir(identity_dir):
        print(f"Directory for {identity} not found.")
        return embeddings
    paths = [os.path.join(identity_dir, fname) for fname in os.listdir(identity_dir)
             if fname.lower().endswith(('.png', '.jpg', '.jpeg'))]
    for path in paths:
        emb = extract_embedding(path)
        if emb is not None:
            embeddings.append(emb)
    return embeddings

# Load embeddings for imposters
def load_imposter_embeddings(enrolled_identity, dataset_dir):
    imposter_embeddings = []
    for person in os.listdir(dataset_dir):
        if person == enrolled_identity:
            continue
        person_dir = os.path.join(dataset_dir, person)
        if not os.path.isdir(person_dir):
            continue
        paths = [os.path.join(person_dir, fname) for fname in os.listdir(person_dir)
                 if fname.lower().endswith(('.png', '.jpg', '.jpeg'))]
        for path in paths:
            emb = extract_embedding(path)
            if emb is not None:
                imposter_embeddings.append(emb)
    return imposter_embeddings

# Main pipeline
def main():
    enrolled_identity = "ben_afflek"  # Change this to the desired identity

    # Load genuine embeddings
    genuine_embeddings = load_embeddings_for_identity(enrolled_identity, data_dir)
    if len(genuine_embeddings) < 2:
        raise ValueError(f"Need at least two images for {enrolled_identity} to compare. Found: {len(genuine_embeddings)}")

    # Use the first embedding as the reference (enrolled identity)
    enrolled_embedding = genuine_embeddings[0]

    # Calculate distances for genuine test
    genuine_scores = [np.linalg.norm(enrolled_embedding - emb) for emb in genuine_embeddings[1:]]

    # Load imposter embeddings
    imposter_embeddings = load_imposter_embeddings(enrolled_identity, data_dir)
    if not imposter_embeddings:
        raise ValueError("No imposter embeddings found. Please check your dataset.")

    # Calculate distances for imposter test
    imposter_scores = [np.linalg.norm(enrolled_embedding - emb) for emb in imposter_embeddings]

    # Print basic statistics
    print(f"Enrolled Identity: {enrolled_identity}")
    print(f"Number of Genuine comparisons: {len(genuine_scores)}")
    print(f"Average Genuine Score: {np.mean(genuine_scores):.4f}")
    print(f"Number of Imposter comparisons: {len(imposter_scores)}")
    print(f"Average Imposter Score: {np.mean(imposter_scores):.4f}")

    # Plot score distributions
    plt.figure(figsize=(10, 6))
    plt.hist(genuine_scores, bins=30, alpha=0.7, label="Genuine Scores", color="green", edgecolor='black')
    plt.hist(imposter_scores, bins=30, alpha=0.7, label="Imposter Scores", color="red", edgecolor='black')
    plt.title("Distribution of Genuine vs. Imposter Scores")
    plt.xlabel("Euclidean Distance")
    plt.ylabel("Frequency")
    plt.legend()
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    main()