import cv2
import torch
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
from utils import load_known_faces, compare_faces

# Setup device and models
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(image_size=160, margin=0, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Load known faces embeddings and names
known_embeddings, known_names = load_known_faces('data/known_faces.pkl')

# Open the default camera (MacBook Pro's 1080p camera)
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Convert the frame from BGR to RGB for processing
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    boxes, _ = mtcnn.detect(rgb_frame)

    if boxes is not None:
        for box in boxes:
            x1, y1, x2, y2 = [int(b) for b in box]
            # Crop and resize face for recognition
            face_img = rgb_frame[y1:y2, x1:x2]
            try:
                face_img = cv2.resize(face_img, (160, 160))
            except cv2.error:
                continue

            # Prepare face tensor
            face_tensor = torch.tensor(face_img).permute(2, 0, 1).unsqueeze(0).float() / 255.0
            face_tensor = face_tensor.to(device)
            embedding = resnet(face_tensor).detach().cpu().numpy()[0]

            # Compare with known faces
            name = compare_faces(embedding, known_embeddings, known_names, threshold=0.9)

            # Draw bounding box and label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, name, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36, 255, 12), 2)

    cv2.imshow('Real-Time Face Recognition', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
