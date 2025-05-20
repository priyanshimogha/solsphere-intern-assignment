#!/usr/bin/env python3
"""
System Health Monitor

A cross-platform utility that monitors system health metrics and reports them to a central server.
This utility checks disk encryption, OS updates, antivirus status, and sleep settings.
"""

import os
import sys
import time
import json
import uuid
import logging
import platform
import subprocess
import threading
from datetime import datetime

# Try to import required libraries, install if missing
try:
    import requests
    import psutil
except ImportError:
    print("Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "psutil"])
    import requests
    import psutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("system_monitor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration
CONFIG = {
    "check_interval_minutes": 30,
    "api_endpoint": "http://localhost:3000/api/system-data",
    "machine_id_file": "machine_id.txt",
    "last_state_file": "last_state.json"
}

class SystemHealthMonitor:
    """Monitors system health metrics and reports changes to a central server."""

    def __init__(self):
        self.machine_id = self._get_machine_id()
        self.last_state = self._load_last_state()
        self.os_type = platform.system()
        logger.info(f"Initialized SystemHealthMonitor for {self.os_type} with ID: {self.machine_id}")

    def _get_machine_id(self):
        """Get or create a unique machine ID."""
        if os.path.exists(CONFIG["machine_id_file"]):
            with open(CONFIG["machine_id_file"], "r") as f:
                return f.read().strip()

        # Generate new machine ID
        machine_id = str(uuid.uuid4())
        with open(CONFIG["machine_id_file"], "w") as f:
            f.write(machine_id)
        return machine_id

    def _load_last_state(self):
        """Load the last reported state from file."""
        if os.path.exists(CONFIG["last_state_file"]):
            try:
                with open(CONFIG["last_state_file"], "r") as f:
                    return json.load(f)
            except json.JSONDecodeError:
                logger.error("Error parsing last state file, starting fresh")
        return None

    def _save_state(self, state):
        """Save the current state to file."""
        with open(CONFIG["last_state_file"], "w") as f:
            json.dump(state, f, indent=2)

    def check_disk_encryption(self):
        """Check if disk is encrypted."""
        # Implementation varies by OS
        if self.os_type == "Windows":
            # Check BitLocker status
            try:
                result = subprocess.run(
                    ["manage-bde", "-status", "C:"],
                    capture_output=True,
                    text=True
                )
                return "Protection On" in result.stdout
            except Exception as e:
                logger.error(f"Error checking BitLocker status: {e}")
                return False

        elif self.os_type == "Darwin":  # macOS
            # Check FileVault status
            try:
                result = subprocess.run(
                    ["fdesetup", "status"],
                    capture_output=True,
                    text=True
                )
                return "FileVault is On" in result.stdout
            except Exception as e:
                logger.error(f"Error checking FileVault status: {e}")
                return False

        elif self.os_type == "Linux":
            # Check for LUKS encryption (simplified)
            try:
                result = subprocess.run(
                    ["lsblk", "-f"],
                    capture_output=True,
                    text=True
                )
                return "crypto_LUKS" in result.stdout
            except Exception as e:
                logger.error(f"Error checking LUKS encryption: {e}")
                return False

        return False

    def check_os_updates(self):
        """Check if OS is up to date."""
        # Implementation varies by OS
        if self.os_type == "Windows":
            try:
                # PowerShell command to check for updates
                cmd = "powershell -Command \"Get-WindowsUpdate\""
                result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
                return "No updates found" in result.stdout
            except Exception as e:
                logger.error(f"Error checking Windows updates: {e}")
                return False

        elif self.os_type == "Darwin":  # macOS
            try:
                result = subprocess.run(
                    ["softwareupdate", "-l"],
                    capture_output=True,
                    text=True
                )
                return "No new software available" in result.stdout
            except Exception as e:
                logger.error(f"Error checking macOS updates: {e}")
                return False

        elif self.os_type == "Linux":
            try:
                # This will vary by distribution
                if os.path.exists("/etc/debian_version"):
                    # Debian/Ubuntu
                    update_cmd = "apt-get -s upgrade"
                elif os.path.exists("/etc/fedora-release"):
                    # Fedora
                    update_cmd = "dnf check-update"
                else:
                    # Generic approach
                    update_cmd = "which apt-get > /dev/null && apt-get -s upgrade || which dnf > /dev/null && dnf check-update"

                result = subprocess.run(update_cmd, shell=True, capture_output=True, text=True)
                # If return code is 0 and no packages listed, system is up to date
                return result.returncode == 0 and "0 upgraded" in result.stdout
            except Exception as e:
                logger.error(f"Error checking Linux updates: {e}")
                return False

        return False

    def check_antivirus(self):
        """Check if antivirus is installed and active."""
        if self.os_type == "Windows":
            try:
                # Check Windows Security status
                cmd = "powershell -Command \"Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled\""
                result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
                return "True" in result.stdout
            except Exception as e:
                logger.error(f"Error checking Windows antivirus: {e}")
                return False

        elif self.os_type == "Darwin":  # macOS
            # macOS has built-in XProtect
            return True

        elif self.os_type == "Linux":
            # Check for common antivirus solutions
            av_processes = ["clamav", "sophos", "avast", "avg"]
            for proc in psutil.process_iter(['name']):
                for av in av_processes:
                    if av in proc.info['name'].lower():
                        return True
            return False

        return False

    def check_sleep_settings(self):
        """Check if inactivity sleep settings are ≤ 10 minutes."""
        if self.os_type == "Windows":
            try:
                cmd = "powershell -Command \"powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE\""
                result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
                # Parse the output to get sleep timeout in seconds
                for line in result.stdout.splitlines():
                    if "STANDBYIDLE" in line and "AC Power" in line:
                        # Extract the value (in seconds)
                        parts = line.split()
                        for i, part in enumerate(parts):
                            if part == "0x00000000":
                                try:
                                    seconds = int(parts[i+1], 16)
                                    return seconds <= 600  # 10 minutes = 600 seconds
                                except (IndexError, ValueError):
                                    pass
            except Exception as e:
                logger.error(f"Error checking Windows sleep settings: {e}")
                return False

        elif self.os_type == "Darwin":  # macOS
            try:
                result = subprocess.run(
                    ["pmset", "-g"],
                    capture_output=True,
                    text=True
                )
                for line in result.stdout.splitlines():
                    if "sleep" in line:
                        try:
                            sleep_min = int(line.split()[1])
                            return sleep_min <= 10
                        except (IndexError, ValueError):
                            pass
            except Exception as e:
                logger.error(f"Error checking macOS sleep settings: {e}")
                return False

        elif self.os_type == "Linux":
            try:
                # Check for common power management tools
                if os.path.exists("/usr/bin/gsettings"):
                    # GNOME
                    cmd = "gsettings get org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout"
                    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                    try:
                        seconds = int(result.stdout.strip())
                        return seconds <= 600  # 10 minutes
                    except ValueError:
                        pass
            except Exception as e:
                logger.error(f"Error checking Linux sleep settings: {e}")
                return False

        return False

    def check_all(self):
        """Run all system health checks and return results."""
        results = {
            "machine_id": self.machine_id,
            "timestamp": datetime.now().isoformat(),
            "os_type": self.os_type,
            "os_version": platform.version(),
            "checks": {
                "disk_encryption": self.check_disk_encryption(),
                "os_updated": self.check_os_updates(),
                "antivirus_active": self.check_antivirus(),
                "sleep_settings_compliant": self.check_sleep_settings()
            }
        }
        return results

    def has_state_changed(self, current_state):
        """Check if the system state has changed since last report."""
        if not self.last_state:
            return True

        # Compare only the check results, not timestamp
        current_checks = current_state["checks"]
        last_checks = self.last_state["checks"]

        return current_checks != last_checks

    def report_to_server(self, data):
        """Send system health data to the central server."""
        try:
            response = requests.post(
                CONFIG["api_endpoint"],
                json=data,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                logger.info("Successfully reported system health data")
                return True
            else:
                logger.error(f"Failed to report data: HTTP {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Error reporting to server: {e}")
            return False

    def run_periodic_check(self):
        """Run system checks and report if state has changed."""
        logger.info("Running system health check...")
        current_state = self.check_all()

        if self.has_state_changed(current_state):
            logger.info("System state has changed, reporting to server")
            if self.report_to_server(current_state):
                self.last_state = current_state
                self._save_state(current_state)
        else:
            logger.info("No changes in system state")

    def start_monitoring(self):
        """Start the monitoring daemon."""
        logger.info(f"Starting system health monitoring every {CONFIG['check_interval_minutes']} minutes")

        # Run initial check
        self.run_periodic_check()

        # Set up periodic checks
        interval_seconds = CONFIG["check_interval_minutes"] * 60

        def run_daemon():
            while True:
                time.sleep(interval_seconds)
                self.run_periodic_check()

        # Start daemon thread
        daemon_thread = threading.Thread(target=run_daemon, daemon=True)
        daemon_thread.start()

        return daemon_thread

def main():
    """Main entry point for the application."""
    try:
        monitor = SystemHealthMonitor()
        daemon_thread = monitor.start_monitoring()

        # Keep the main thread alive
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        logger.info("Monitoring stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
