import os
import pickle
import numpy as np

def load_known_faces(pickle_path):
    """Load known face embeddings and names from a pickle file."""
    if os.path.exists(pickle_path):
        try:
            with open(pickle_path, 'rb') as f:
                data = pickle.load(f)
            return np.array(data['embeddings']), data['names']
        except Exception as e:
            print(f"Error loading known faces: {e}")
            return np.array([]), []
    else:
        print(f"Warning: No known faces file at {pickle_path}")
        return np.array([]), []

def compare_faces(face_embedding, known_embeddings, known_names, threshold=0.9):
    """
    Compare a face embedding with known embeddings and return the name of the closest match.
    
    Args:
        face_embedding: The embedding vector of the detected face
        known_embeddings: List of known face embeddings
        known_names: List of names corresponding to known_embeddings
        threshold: Maximum distance to consider a match (lower is stricter)
        
    Returns:
        name: Name of the closest matching person or "Unknown"
        min_distance: Distance to the closest match
    """
    if len(known_embeddings) == 0:
        return "Unknown", 1.0
    
    # Calculate Euclidean distances
    distances = np.linalg.norm(known_embeddings - face_embedding, axis=1)
    
    # Find the index of the minimum distance
    min_index = np.argmin(distances)
    min_distance = distances[min_index]
    
    # Return the name if distance is below threshold
    if min_distance < threshold:
        return known_names[min_index], min_distance
    else:
        return "Unknown", min_distance
