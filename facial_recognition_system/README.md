# OpenSesame Facial Recognition System for PYNQ Board

This repository contains the optimized version of the OpenSesame facial recognition system designed for deployment on a PYNQ board with a Logitech camera.

## System Requirements

- PYNQ board (with network access)
- Logitech USB camera
- Python 3.6+ with pip

## Installation

1. **Set up the PYNQ Board:**

   Connect your PYNQ board to your network and power it on. Once booted, you can access it via SSH:

   ```bash
   ssh xilinx@<pynq-ip-address>
   # Default password is typically 'xilinx'
   ```

2. **Create Project Directory:**

   ```bash
   # On the PYNQ board
   mkdir -p ~/facial_recognition
   ```

3. **Transfer Files:**

   From your development machine, copy the files to the PYNQ board:

   ```bash
   # Transfer the entire repository
   scp -r /path/to/facial_recognition_system/* xilinx@<pynq-ip-address>:~/facial_recognition/
   ```

4. **Install Required Packages:**

   ```bash
   # On the PYNQ board
   cd ~/facial_recognition
   
   # Update package lists
   sudo apt-get update
   
   # Install dependencies
   pip3 install -r requirements.txt --index-url https://download.pytorch.org/whl/cpu
   ```

## Usage

1. **Run the Facial Recognition System:**

   ```bash
   cd ~/facial_recognition/src
   python3 pynq_recognition.py
   ```

2. **Controls:**

   - Press 'q' to quit the application

## Adding New Faces and Automatic Retraining

This system features automatic retraining capabilities to keep the facial recognition model updated.

### Adding New Faces Through Camera

1. **Capture new face images** using the provided tool:

   ```bash
   cd ~/facial_recognition/src
   python3 add_new_face.py john_smith --num 5
   ```

   This will take 5 photos of the person named "John Smith" after a countdown.

2. **Parameters:**
   - `name`: The person's name (use underscores for spaces)
   - `--num`: Number of pictures to take (default: 5)
   - `--delay`: Countdown seconds between pictures (default: 2)

### Setting Up Automatic Nightly Retraining

1. **Configure the automatic retraining** (default: 3:00 AM):

   ```bash
   cd ~/facial_recognition/src
   python3 setup_cron.py
   ```

2. **Custom scheduling:**

   ```bash
   # Set retraining to occur at 4:30 AM
   python3 setup_cron.py --hour 4 --minute 30
   ```

3. **Manual retraining:**

   ```bash
   # Retrain immediately
   python3 nightly_train.py
   ```

4. **Monitoring:** Training logs are saved to `~/facial_recognition/nightly_train.log`

### How It Works

- New faces are stored in `data/known_faces/{person_name}/`
- Each night, the system scans all images in these directories
- A backup of the current model is created in `data/model_backups/`
- A new model is generated with all faces and stored in `data/known_faces.pkl`

## Performance Optimization

If you experience performance issues with the facial recognition system on the PYNQ board, you can try the following optimizations:

1. **Reduce Frame Resolution:**
   Open `src/pynq_recognition.py` and modify the camera resolution:
   ```python
   cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)  # Reduce from 640
   cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)  # Reduce from 480
   ```

2. **Process Fewer Frames:**
   Increase the value of `PROCESS_EVERY_N_FRAMES` in `pynq_recognition.py`:
   ```python
   PROCESS_EVERY_N_FRAMES = 5  # Increase from 3
   ```

3. **Adjust Face Detection Parameters:**
   Increase the minimum face size to reduce false positives:
   ```python
   min_face_size=60  # Increase from 40
   ```

## Troubleshooting

1. **Camera Not Detected:**
   If the camera is not detected, try changing the camera index:
   ```python
   cap = cv2.VideoCapture(1)  # Try different indices (0, 1, 2)
   ```

2. **Memory Errors:**
   If you encounter memory errors, try:
   - Reducing the image processing resolution
   - Closing other applications on the PYNQ board
   - Restarting the PYNQ board

3. **Slow Performance:**
   - Ensure the PYNQ board has adequate cooling
   - Use a lower resolution for video capture
   - Increase the frame skip parameter

## Auto-Start on Boot (Optional)

To have the facial recognition system start automatically when the PYNQ board boots:

1. Create a systemd service file:
   ```bash
   sudo nano /etc/systemd/system/facial-recognition.service
   ```

2. Add the following content:
   ```
   [Unit]
   Description=Facial Recognition Service
   After=network.target
   
   [Service]
   ExecStart=/usr/bin/python3 /home/xilinx/facial_recognition/src/pynq_recognition.py
   WorkingDirectory=/home/xilinx/facial_recognition/src
   Restart=always
   User=xilinx
   
   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl enable facial-recognition.service
   sudo systemctl start facial-recognition.service
   ```
