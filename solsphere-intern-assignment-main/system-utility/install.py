#!/usr/bin/env python3
"""
Installation script for System Health Monitor

This script installs the System Health Monitor as a background service/daemon
on Windows, macOS, or Linux.
"""

import os
import sys
import shutil
import platform
import subprocess
import argparse
from pathlib import Path

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Install System Health Monitor")
    parser.add_argument("--interval", type=int, default=30,
                        help="Check interval in minutes (default: 30)")
    parser.add_argument("--api-url", type=str, default="http://localhost:3000/api/system-data",
                        help="API endpoint URL")
    return parser.parse_args()

def install_dependencies():
    """Install required Python dependencies."""
    print("Installing dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psutil", "requests"])

def install_windows(args):
    """Install as a scheduled task on Windows."""
    print("Installing on Windows...")
    
    # Create installation directory
    install_dir = os.path.join(os.environ["PROGRAMFILES"], "SystemHealthMonitor")
    os.makedirs(install_dir, exist_ok=True)
    
    # Copy files
    script_path = os.path.abspath("system_monitor.py")
    shutil.copy(script_path, os.path.join(install_dir, "system_monitor.py"))
    
    # Create batch file to run the script
    batch_path = os.path.join(install_dir, "run_monitor.bat")
    with open(batch_path, "w") as f:
        f.write(f'@echo off\n"{sys.executable}" "{os.path.join(install_dir, "system_monitor.py")}"\n')
    
    # Create scheduled task
    task_name = "SystemHealthMonitor"
    cmd = [
        "schtasks", "/create", "/tn", task_name,
        "/tr", batch_path,
        "/sc", "onstart",
        "/ru", "SYSTEM",
        "/f"  # Force creation
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"Successfully installed System Health Monitor as scheduled task '{task_name}'")
        print("Starting the service...")
        subprocess.run(["schtasks", "/run", "/tn", task_name])
    except subprocess.CalledProcessError as e:
        print(f"Error creating scheduled task: {e}")
        print("You may need to run this script as administrator.")
        sys.exit(1)

def install_macos(args):
    """Install as a LaunchDaemon on macOS."""
    print("Installing on macOS...")
    
    # Create installation directory
    install_dir = "/Library/SystemHealthMonitor"
    os.makedirs(install_dir, exist_ok=True)
    
    # Copy files
    script_path = os.path.abspath("system_monitor.py")
    shutil.copy(script_path, os.path.join(install_dir, "system_monitor.py"))
    
    # Create plist file
    plist_path = "/Library/LaunchDaemons/com.systemhealthmonitor.plist"
    plist_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.systemhealthmonitor</string>
    <key>ProgramArguments</key>
    <array>
        <string>{sys.executable}</string>
        <string>{os.path.join(install_dir, "system_monitor.py")}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/systemhealthmonitor.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/systemhealthmonitor.log</string>
</dict>
</plist>
"""
    
    with open(plist_path, "w") as f:
        f.write(plist_content)
    
    # Set permissions
    os.chmod(plist_path, 0o644)
    
    # Load the daemon
    try:
        subprocess.run(["launchctl", "load", plist_path], check=True)
        print("Successfully installed System Health Monitor as LaunchDaemon")
    except subprocess.CalledProcessError as e:
        print(f"Error loading LaunchDaemon: {e}")
        print("You may need to run this script as root (sudo).")
        sys.exit(1)

def install_linux(args):
    """Install as a systemd service on Linux."""
    print("Installing on Linux...")
    
    # Create installation directory
    install_dir = "/opt/systemhealthmonitor"
    os.makedirs(install_dir, exist_ok=True)
    
    # Copy files
    script_path = os.path.abspath("system_monitor.py")
    shutil.copy(script_path, os.path.join(install_dir, "system_monitor.py"))
    
    # Make script executable
    os.chmod(os.path.join(install_dir, "system_monitor.py"), 0o755)
    
    # Create systemd service file
    service_path = "/etc/systemd/system/systemhealthmonitor.service"
    service_content = f"""[Unit]
Description=System Health Monitor
After=network.target

[Service]
ExecStart={sys.executable} {os.path.join(install_dir, "system_monitor.py")}
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
WorkingDirectory={install_dir}

[Install]
WantedBy=multi-user.target
"""
    
    with open(service_path, "w") as f:
        f.write(service_content)
    
    # Enable and start the service
    try:
        subprocess.run(["systemctl", "daemon-reload"], check=True)
        subprocess.run(["systemctl", "enable", "systemhealthmonitor"], check=True)
        subprocess.run(["systemctl", "start", "systemhealthmonitor"], check=True)
        print("Successfully installed System Health Monitor as systemd service")
    except subprocess.CalledProcessError as e:
        print(f"Error setting up systemd service: {e}")
        print("You may need to run this script as root (sudo).")
        sys.exit(1)

def main():
    """Main entry point for the installer."""
    args = parse_args()
    
    # Check if running with admin/root privileges
    if os.name == "nt":  # Windows
        try:
            # This will fail if not running as admin
            subprocess.check_output("net session", shell=True, stderr=subprocess.DEVNULL)
        except subprocess.CalledProcessError:
            print("Error: This script must be run as administrator")
            sys.exit(1)
    elif os.geteuid() != 0:  # Unix-like
        print("Error: This script must be run as root (sudo)")
        sys.exit(1)
    
    # Install dependencies
    install_dependencies()
    
    # Install based on platform
    system = platform.system()
    if system == "Windows":
        install_windows(args)
    elif system == "Darwin":  # macOS
        install_macos(args)
    elif system == "Linux":
        install_linux(args)
    else:
        print(f"Unsupported platform: {system}")
        sys.exit(1)
    
    print("Installation complete!")

if __name__ == "__main__":
    main()
