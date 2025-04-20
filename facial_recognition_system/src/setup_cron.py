import os
import subprocess
import argparse
import platform

def setup_cron(hour=3, minute=0):
    """
    Setup a cron job to run the nightly_train.py script.
    Default time is 3:00 AM (when the system is likely not in use)
    """
    if platform.system() != 'Linux':
        print("Warning: This script is designed for Linux systems (like the PYNQ board).")
        print("Cron setup will only work on Linux. On other systems, please setup scheduled tasks manually.")
        return False
    
    # Get the absolute path to the nightly_train.py script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    train_script = os.path.join(script_dir, "nightly_train.py")
    log_file = os.path.join(os.path.dirname(script_dir), "nightly_train.log")
    
    # Generate the cron job line
    cron_line = f"{minute} {hour} * * * cd {script_dir} && /usr/bin/python3 {train_script} >> {log_file} 2>&1"
    
    # Get existing crontab
    try:
        current_crontab = subprocess.check_output("crontab -l", shell=True).decode('utf-8')
    except subprocess.CalledProcessError:
        # No crontab exists yet
        current_crontab = ""
    
    # Check if our job already exists
    if "nightly_train.py" in current_crontab:
        print("Cron job for facial recognition training already exists.")
        print("To modify it, please edit your crontab manually with 'crontab -e'")
        return True
    
    # Add our line
    new_crontab = current_crontab.strip() + "\n" + cron_line + "\n"
    
    # Write to a temporary file
    temp_file = "/tmp/facial_recognition_crontab"
    with open(temp_file, 'w') as f:
        f.write(new_crontab)
    
    # Install the new crontab
    try:
        result = subprocess.run(f"crontab {temp_file}", shell=True, check=True)
        os.unlink(temp_file)  # Clean up
        print(f"Successfully scheduled nightly retraining at {hour:02d}:{minute:02d} AM")
        print(f"Training log will be saved to: {log_file}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to install crontab: {e}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Setup automatic nightly retraining")
    parser.add_argument("--hour", type=int, default=3, help="Hour for retraining (24-hour format, default: 3)")
    parser.add_argument("--minute", type=int, default=0, help="Minute for retraining (default: 0)")
    args = parser.parse_args()
    
    setup_cron(args.hour, args.minute)