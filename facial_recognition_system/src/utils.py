import os
import pickle
import numpy as np

def load_known_faces(pickle_path):
    """
    Load known face embeddings and names from a pickle file.
    Returns: (numpy.ndarray, list) -> embeddings, names.
    """
    if os.path.exists(pickle_path):
        with open(pickle_path, 'rb') as f:
            data = pickle.load(f)
        return data['embeddings'], data['names']
    else:
        return np.array([]), []

def save_known_faces(embeddings, names, pickle_path):
    data = {'embeddings': embeddings, 'names': names}
    with open(pickle_path, 'wb') as f:
        pickle.dump(data, f)

def compare_faces(face_embedding, known_embeddings, known_names, threshold=0.9):
    """
    Compare a face embedding with known embeddings and return the matching name
    if the minimum Euclidean distance is below the threshold.
    """
    if known_embeddings.size == 0:
        return "Unknown"
    
    # Compute Euclidean distances
    distances = np.linalg.norm(known_embeddings - face_embedding, axis=1)
    min_index = np.argmin(distances)
    if distances[min_index] < threshold:
        return known_names[min_index]
    else:
        return "Unknown"
