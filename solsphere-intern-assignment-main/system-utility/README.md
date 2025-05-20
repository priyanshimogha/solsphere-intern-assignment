# System Health Monitor

A cross-platform utility that monitors system health metrics and reports them to a central server.

## Features

- Runs on Windows, macOS, and Linux
- Checks system health metrics:
  - Disk encryption status
  - OS update status
  - Antivirus presence and status
  - Inactivity sleep settings (should be ≤ 10 minutes)
- Runs as a background daemon
- Reports data to a central server only when changes are detected
- Configurable check interval (default: 30 minutes)

## Requirements

- Python 3.6+
- Required packages:
  - psutil
  - requests

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

Run the utility:

```
python system_monitor.py
```

### Configuration

You can modify the following settings in the `CONFIG` dictionary:

- `check_interval_minutes`: How often to check system health (default: 30)
- `api_endpoint`: URL of the central server API
- `machine_id_file`: File to store the unique machine ID
- `last_state_file`: File to store the last reported state

## How It Works

1. The utility generates a unique machine ID on first run
2. It performs system health checks based on the current operating system
3. If any changes are detected since the last check, it reports the data to the central server
4. The utility continues to run in the background, checking at the specified interval

## System-Specific Implementations

### Windows
- Disk Encryption: Checks BitLocker status
- OS Updates: Uses PowerShell to check for Windows updates
- Antivirus: Checks Windows Security status
- Sleep Settings: Uses powercfg to check standby idle timeout

### macOS
- Disk Encryption: Checks FileVault status
- OS Updates: Uses softwareupdate to check for updates
- Antivirus: Assumes XProtect is active
- Sleep Settings: Uses pmset to check sleep timeout

### Linux
- Disk Encryption: Checks for LUKS encryption
- OS Updates: Varies by distribution (apt/dnf)
- Antivirus: Checks for common antivirus processes
- Sleep Settings: Checks GNOME power settings

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request


