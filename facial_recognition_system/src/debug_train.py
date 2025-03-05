import pickle
import numpy as np

# Load known faces
with open('../data/known_faces.pkl', 'rb') as f:
    data = pickle.load(f)

embeddings = np.array(data['embeddings'])
names = data['names']

print(f"Number of saved embeddings: {len(embeddings)}")
print(f"Names associated with embeddings: {names}")
