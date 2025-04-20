import os
import pickle
import torch
import numpy as np
from PIL import Image
from datetime import datetime
from facenet_pytorch import MTCNN, InceptionResnetV1

# Configuration
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
FACES_DIR = os.path.join(DATA_DIR, 'known_faces')  # Directory containing subdirectories of face images
MODEL_PATH = os.path.join(DATA_DIR, 'known_faces.pkl')
BACKUP_DIR = os.path.join(DATA_DIR, 'model_backups')  # For backing up old models
DEVICE = torch.device('cpu')

# Ensure backup directory exists
os.makedirs(BACKUP_DIR, exist_ok=True)

def extract_embeddings():
    print(f"[{datetime.now()}] Starting model retraining...")
    
    # Initialize the models
    mtcnn = MTCNN(image_size=160, margin=0, device=DEVICE)
    resnet = InceptionResnetV1(pretrained='vggface2').eval().to(DEVICE)
    
    # Check if faces directory exists
    if not os.path.isdir(FACES_DIR):
        print(f"Error: Faces directory {FACES_DIR} not found!")
        return False
        
    # Get list of identities (subdirectories)
    identities = [d for d in os.listdir(FACES_DIR) 
                if os.path.isdir(os.path.join(FACES_DIR, d))]
    
    if not identities:
        print("No identity folders found in faces directory!")
        return False
        
    print(f"Found {len(identities)} identities to process")
    
    # Process each identity
    all_embeddings = []
    all_names = []
    
    for identity in identities:
        identity_dir = os.path.join(FACES_DIR, identity)
        image_paths = [os.path.join(identity_dir, f) for f in os.listdir(identity_dir)
                     if f.lower().endswith(('.png', '.jpg', '.jpeg', '.JPG', '.JPEG'))]
        
        if not image_paths:
            print(f"No images found for {identity}, skipping")
            continue
            
        print(f"Processing {len(image_paths)} images for {identity}")
        
        # Process each image
        for img_path in image_paths:
            try:
                img = Image.open(img_path).convert('RGB')
                face = mtcnn(img)
                
                if face is None:
                    print(f"No face detected in {img_path}")
                    continue
                    
                # Get embedding
                face = face.unsqueeze(0).to(DEVICE)
                with torch.no_grad():
                    embedding = resnet(face)
                
                # Add to our lists
                all_embeddings.append(embedding.cpu().numpy().flatten())
                all_names.append(identity)
                print(f"Successfully processed: {img_path}")
                
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
    
    if not all_embeddings:
        print("No face embeddings were generated!")
        return False
        
    # Backup existing model if it exists
    if os.path.exists(MODEL_PATH):
        backup_file = os.path.join(BACKUP_DIR, f"known_faces_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl")
        try:
            print(f"Backing up existing model to {backup_file}")
            import shutil
            shutil.copy2(MODEL_PATH, backup_file)
        except Exception as e:
            print(f"Backup failed: {e}")
    
    # Save the new model
    data = {
        'embeddings': all_embeddings,
        'names': all_names
    }
    
    try:
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(data, f)
        print(f"[{datetime.now()}] Successfully saved new model with {len(all_names)} face embeddings")
        return True
    except Exception as e:
        print(f"Failed to save model: {e}")
        return False

if __name__ == "__main__":
    success = extract_embeddings()
    exit(0 if success else 1)