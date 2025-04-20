import cv2
import torch
import numpy as np
import time
from facenet_pytorch import MTCNN, InceptionResnetV1
import os
import pickle

# Configuration
MODEL_IMAGE_SIZE = 160
RECOGNITION_THRESHOLD = 0.9
PROCESS_EVERY_N_FRAMES = 3  # Process every 3rd frame for better performance
DEVICE = torch.device('cpu')  # PYNQ has no GPU

# Path setup
KNOWN_FACES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data/known_faces.pkl')

def load_known_faces(pickle_path):
    """Load known face embeddings and names from a pickle file."""
    if os.path.exists(pickle_path):
        with open(pickle_path, 'rb') as f:
            data = pickle.load(f)
        return data['embeddings'], data['names']
    else:
        print(f"Warning: No known faces file at {pickle_path}")
        return np.array([]), []

def compare_faces(face_embedding, known_embeddings, known_names, threshold=RECOGNITION_THRESHOLD):
    """Compare a face embedding with known embeddings."""
    if known_embeddings.size == 0:
        return "Unknown"
    
    # Compute Euclidean distances
    distances = np.linalg.norm(known_embeddings - face_embedding, axis=1)
    min_index = np.argmin(distances)
    min_distance = distances[min_index]
    
    if min_distance < threshold:
        return f"{known_names[min_index]} ({min_distance:.2f})"
    else:
        return f"Unknown ({min_distance:.2f})"

def main():
    print("Initializing facial recognition system...")
    
    # Load pre-trained models - use smaller settings for PYNQ
    mtcnn = MTCNN(
        image_size=MODEL_IMAGE_SIZE, 
        margin=0,
        min_face_size=40,  # Increase for better performance
        thresholds=[0.6, 0.7, 0.9],  # Less strict thresholds
        factor=0.709,
        keep_all=True,
        device=DEVICE
    )
    resnet = InceptionResnetV1(pretrained='vggface2').eval().to(DEVICE)
    
    # Load known faces
    print(f"Loading known faces from {KNOWN_FACES_PATH}")
    known_embeddings, known_names = load_known_faces(KNOWN_FACES_PATH)
    print(f"Loaded {len(known_names)} known faces")
    
    # Initialize camera (try different indices if needed)
    print("Initializing camera...")
    cap = cv2.VideoCapture(0)  # Try USB port 0 first
    if not cap.isOpened():
        cap = cv2.VideoCapture(1)  # Try USB port 1 if first attempt fails
    
    if not cap.isOpened():
        print("Error: Could not open Logitech camera. Check connection.")
        return
    
    # Set lower resolution for better performance
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    print("Starting facial recognition loop...")
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break
            
        frame_count += 1
        if frame_count % PROCESS_EVERY_N_FRAMES != 0:
            # Display the frame without processing
            cv2.imshow('PYNQ Facial Recognition', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            continue
        
        # Process this frame (every Nth frame)
        start_time = time.time()
        
        # Convert BGR to RGB for PyTorch models
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        try:
            boxes, _ = mtcnn.detect(rgb_frame)
            
            if boxes is not None:
                for box in boxes:
                    # Get coordinates with a small margin
                    x1, y1, x2, y2 = [int(b) for b in box]
                    
                    # Make sure box coordinates are within frame
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(frame.shape[1], x2), min(frame.shape[0], y2)
                    
                    if x2 > x1 and y2 > y1:  # Valid box
                        # Extract face
                        face_img = rgb_frame[y1:y2, x1:x2]
                        
                        # Convert to PIL and process
                        from PIL import Image
                        pil_img = Image.fromarray(face_img).resize((MODEL_IMAGE_SIZE, MODEL_IMAGE_SIZE))
                        
                        # Get embedding
                        face_tensor = mtcnn(pil_img).unsqueeze(0).to(DEVICE)
                        if face_tensor is not None:
                            with torch.no_grad():  # No need for gradients
                                embedding = resnet(face_tensor).cpu().numpy().flatten()
                            
                            # Compare with known faces
                            name = compare_faces(embedding, known_embeddings, known_names)
                            
                            # Draw rectangle and name
                            color = (0, 255, 0) if "Unknown" not in name else (0, 0, 255)
                            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                            cv2.putText(frame, name, (x1, y1 - 10),
                                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        except Exception as e:
            print(f"Error processing frame: {e}")
                        
        end_time = time.time()
        fps = 1 / (end_time - start_time)
        cv2.putText(frame, f"FPS: {fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Display the frame
        cv2.imshow('PYNQ Facial Recognition', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()