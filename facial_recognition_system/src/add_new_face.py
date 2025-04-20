import os
import cv2
import time
import argparse
from datetime import datetime

def main():
    parser = argparse.ArgumentParser(description="Add new face to the training dataset")
    parser.add_argument('name', type=str, help="Name of the person (use underscore for spaces)")
    parser.add_argument('--num', type=int, default=5, help="Number of photos to take")
    parser.add_argument('--delay', type=int, default=2, help="Seconds between photos")
    args = parser.parse_args()
    
    # Create directory path
    person_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                             'data', 'known_faces', args.name)
    os.makedirs(person_dir, exist_ok=True)
    
    print(f"Taking {args.num} photos for {args.name}")
    print("Position the face in the frame and press SPACE to start capturing")
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        cap = cv2.VideoCapture(1)
    
    if not cap.isOpened():
        print("Could not open camera!")
        return
    
    # Display live feed until ready
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        cv2.imshow('Camera Feed', frame)
        key = cv2.waitKey(1) & 0xFF
        
        if key == 32:  # SPACE key
            break
        elif key == 27:  # ESC key
            cap.release()
            cv2.destroyAllWindows()
            return
    
    # Start capturing images
    for i in range(args.num):
        # Display countdown
        for j in range(args.delay, 0, -1):
            ret, frame = cap.read()
            if not ret:
                break
                
            # Display countdown number
            cv2.putText(frame, str(j), (frame.shape[1]//2, frame.shape[0]//2), 
                       cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)
            cv2.imshow('Camera Feed', frame)
            cv2.waitKey(1)
            time.sleep(1)
            
        # Take picture
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture image")
            break
            
        # Save image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{args.name}_{timestamp}_{i+1}.jpg"
        filepath = os.path.join(person_dir, filename)
        
        cv2.imwrite(filepath, frame)
        print(f"Saved {filepath}")
        
        # Show captured image
        cv2.putText(frame, "Captured!", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow('Camera Feed', frame)
        cv2.waitKey(500)  # Show "Captured!" for half a second
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"Captured {args.num} images for {args.name}")
    print("Images will be included in next automatic retraining")
    print("To retrain immediately, run: python nightly_train.py")

if __name__ == "__main__":
    main()