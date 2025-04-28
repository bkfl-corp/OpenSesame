# https://www.kaggle.com/code/yeye2918/starter-labelled-faces-in-the-wild-3aaf4a47-a
import os
import numpy as np
import matplotlib.pyplot as plt
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from random import sample
from sklearn.metrics import roc_curve, auc

# Device and model setup
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")
mtcnn = MTCNN(image_size=160, margin=0, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Path to nested lfw-deepfunneled dataset
lfw_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'lfw-deepfunneled', 'lfw-deepfunneled')
print(f"Dataset directory: {lfw_dir}")

# Helper: Extract embedding from an image path
def extract_embedding(image_path):
    try:
        # print(f"Extracting embedding from: {os.path.basename(image_path)}")
        image = Image.open(image_path).convert('RGB')
        face = mtcnn(image)
        if face is None:
            print(f"❌ No face detected in {image_path}")
            return None
        face = face.unsqueeze(0).to(device)
        with torch.no_grad():
            embedding = resnet(face)
        return embedding.cpu().numpy().flatten()
    except Exception as e:
        print(f"❌ Error processing {image_path}: {e}")
        return None

# Load embeddings for one identity
def load_embeddings_for_identity(identity_dir):
    print(f"Loading images from identity: {os.path.basename(identity_dir)}")
    paths = [os.path.join(identity_dir, fname) for fname in os.listdir(identity_dir)
             if fname.lower().endswith(('.jpg', '.jpeg', '.png'))]
    embeddings = [extract_embedding(p) for p in paths]
    usable = [emb for emb in embeddings if emb is not None]
    print(f"✔ Loaded {len(usable)} usable embeddings out of {len(paths)} total")
    return usable

# Split embeddings into enroll/test
def split_identity_embeddings(embeddings, enroll_count=1):
    if len(embeddings) <= enroll_count:
        return None, None
    shuffled = sample(embeddings, len(embeddings))
    return shuffled[:enroll_count], shuffled[enroll_count:]

# Run multiple trials for verification
def run_multiple_trials(dataset_dir, min_images=4, identities_per_trial=5, num_trials=10):
    all_results = []
    people = [(p, os.path.join(dataset_dir, p)) for p in os.listdir(dataset_dir)
              if os.path.isdir(os.path.join(dataset_dir, p))]
    people = [p for p in people if len(os.listdir(p[1])) >= min_images]
    print(f"Found {len(people)} identities with >= {min_images} images")

    for trial in range(num_trials):
        print(f"\n🚀 Trial {trial + 1}/{num_trials}")
        trial_genuine = []
        trial_imposter = []
        trial_identities = sample(people, identities_per_trial)

        for person, path in trial_identities:
            print(f"\n▶ Identity: {person}")
            embeddings = load_embeddings_for_identity(path)
            enroll, test = split_identity_embeddings(embeddings, enroll_count=1)
            if not enroll or not test:
                print(f"Skipping {person}, not enough test data.")
                continue
            enrolled_embedding = enroll[0]
            genuine_scores = [np.linalg.norm(enrolled_embedding - emb) for emb in test]

            other_identities = [p for p in people if p[0] != person]
            imposter_candidates = sample(other_identities, min(len(other_identities), 20))                   # tune this
            imposter_embeddings = []
            for imp_person, imp_path in imposter_candidates:
                imp_embs = load_embeddings_for_identity(imp_path)
                if imp_embs:
                    imposter_embeddings.append(sample(imp_embs, 1)[0])

            imposter_scores = [np.linalg.norm(enrolled_embedding - emb) for emb in imposter_embeddings]
            trial_genuine.extend(genuine_scores)
            trial_imposter.extend(imposter_scores)

        print(f"✅ Trial {trial + 1} complete: Genuine = {len(trial_genuine)}, Imposter = {len(trial_imposter)}")
        print(f"📊 Mean G: {np.mean(trial_genuine):.4f} | Mean I: {np.mean(trial_imposter):.4f}")
        all_results.append({
            'trial': trial,
            'genuine_scores': trial_genuine,
            'imposter_scores': trial_imposter
        })

    return all_results

# Plot ROC curve and calculate AUC
def plot_roc_auc(all_results):
    print("📈 Generating ROC curve and decision threshold visualization...")
    y_scores = []
    y_labels = []
    for result in all_results:
        y_scores.extend(result['genuine_scores'])
        y_labels.extend([1] * len(result['genuine_scores']))
        y_scores.extend(result['imposter_scores'])
        y_labels.extend([0] * len(result['imposter_scores']))

    fpr, tpr, thresholds = roc_curve(y_labels, [-s for s in y_scores])
    roc_auc = auc(fpr, tpr)

    os.makedirs("../results", exist_ok=True)

    # ROC Curve
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='blue', label=f'ROC curve (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], linestyle='--', color='gray')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve for Face Verification')
    plt.legend(loc='lower right')
    plt.grid(True)
    plt.tight_layout()
    plt.savefig("../results/roc_curve.png")
    plt.close()

    # Histogram (Genuine vs Imposter Distributions)
    genuine = [s for result in all_results for s in result['genuine_scores']]
    imposter = [s for result in all_results for s in result['imposter_scores']]

    plt.figure(figsize=(8, 6))
    plt.hist(imposter, bins=30, alpha=0.7, label='Imposter', color='red', edgecolor='black')
    plt.hist(genuine, bins=30, alpha=0.7, label='Genuine', color='green', edgecolor='black')
    plt.axvline(x=np.median(genuine + imposter), color='black', linestyle='--', label='Decision Threshold')
    plt.xlabel('Matching Score (Euclidean Distance)')
    plt.ylabel('Frequency')
    plt.title('Score Distributions: Genuine vs Imposter')
    plt.legend()
    plt.tight_layout()
    plt.savefig("../results/distribution_threshold.png")
    plt.close()

    print("✅ Saved: ../results/roc_curve.png and distribution_threshold.png")

# Main runner
if __name__ == "__main__":
    results = run_multiple_trials(lfw_dir, min_images=5, identities_per_trial=10, num_trials=50)
    plot_roc_auc(results)
