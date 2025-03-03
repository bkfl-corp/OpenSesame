import os
import cv2
import torch
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
from utils import save_known_faces

# Setup device and models
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(image_size=160, margin=0, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

known_faces = []
known_names = []
data_dir = 'data/known_faces/'

# Iterate through each person in the known_faces directory
for person_name in os.listdir(data_dir):
    person_dir = os.path.join(data_dir, person_name)
    if os.path.isdir(person_dir):
        for image_name in os.listdir(person_dir):
            image_path = os.path.join(person_dir, image_name)
            img = cv2.imread(image_path)
            if img is None:
                continue
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            # Use MTCNN to detect and crop the face
            face = mtcnn(img_rgb)
            if face is not None:
                # Ensure the face tensor has the expected shape
                face = face.unsqueeze(0).to(device)
                embedding = resnet(face).detach().cpu().numpy()[0]
                known_faces.append(embedding)
                known_names.append(person_name)

if known_faces:
    known_faces = np.array(known_faces)
    save_known_faces(known_faces, known_names, 'data/known_faces.pkl')
    print("Known faces registered and saved to data/known_faces.pkl")
else:
    print("No faces found. Please check your data directory.")
