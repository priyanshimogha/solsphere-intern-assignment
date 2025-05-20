# Cross-Platform System Utility + Admin Dashboard

A comprehensive system monitoring solution that includes:
- A cross-platform utility to collect system health data from client machines
- A backend server to store and manage the collected data
- An admin dashboard to centrally view and analyze system health information

## Project Overview

This project provides IT administrators with a centralized way to monitor the security and compliance status of multiple machines across their organization. The system checks for disk encryption, OS updates, antivirus status, and sleep settings, helping ensure that all machines meet security requirements.

## Project Structure

- `system-utility/`: Cross-platform Python application for collecting system health data
- `backend/`: Node.js/Express API server for receiving and storing system data
- `admin-dashboard/`: React-based web UI for displaying system health information

## System Utility Features

- Cross-platform support (Windows, macOS, Linux)
- System health checks:
  - Disk encryption status (BitLocker, FileVault, LUKS)
  - OS update status (checks if system is up to date)
  - Antivirus presence and status
  - Inactivity sleep settings (verifies ≤ 10 minutes for security)
- Background daemon for periodic checks (every 15-60 minutes)
- Secure communication with the backend
- Reports data only when changes are detected to minimize network traffic
- Unique machine ID generation for tracking individual systems

## Backend Server Features

- RESTful API for receiving system data from client utilities
- MongoDB database for persistent storage
- Endpoints for querying and filtering machine data:
  - List all machines with their latest status
  - Filter by OS type, issues, etc.
  - Get detailed history for specific machines
- CSV export functionality for reporting

## Admin Dashboard Features

- Real-time display of system health data
- Filtering and sorting options (by OS, status, etc.)
- Visual indicators for system issues
- Detailed machine information view
- OS distribution charts and compliance statistics
- Responsive design for desktop and mobile viewing

## Getting Started

### Prerequisites

- Python 3.6+ (for System Utility)
- Node.js 14+ (for Backend and Admin Dashboard)
- MongoDB (for Backend)
- Modern web browser (for Admin Dashboard)

### Installation and Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

#### 2. Backend Server Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure MongoDB connection
# Edit .env file with your MongoDB connection string
# Default: mongodb://localhost:27017/system-monitor

# Start the server
node server.js
```

The backend server will run on http://localhost:3000 by default.

#### 3. Admin Dashboard Setup

```bash
# Navigate to admin dashboard directory
cd admin-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The admin dashboard will be available at http://localhost:5173.

#### 4. System Utility Setup

```bash
# Navigate to system utility directory
cd system-utility

# Install dependencies
pip install -r requirements.txt

# Run the utility (for testing)
python system_monitor.py

# Install as a system service (requires admin/root privileges)
# Windows: Run as Administrator
# macOS/Linux: Use sudo
sudo python install.py
```

By default, the system utility will check for changes every 30 minutes and report to http://localhost:3000/api/system-data.

### Configuration

#### System Utility Configuration

Edit the `CONFIG` dictionary in `system_monitor.py` to customize:
- `check_interval_minutes`: How often to check system health (default: 30)
- `api_endpoint`: URL of the backend API (default: http://localhost:3000/api/system-data)

#### Backend Server Configuration

Edit the `.env` file to customize:
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/system-monitor)

## Deployment

### System Utility Deployment

The `install.py` script will install the utility as a background service:
- Windows: Creates a scheduled task that runs at startup
- macOS: Creates a LaunchDaemon
- Linux: Creates a systemd service

### Backend Server Deployment

For production deployment, consider:
- Using a process manager like PM2
- Setting up HTTPS with a proper SSL certificate
- Configuring a production MongoDB instance

### Admin Dashboard Deployment

Build for production:
```bash
cd admin-dashboard
npm run build
```

Deploy the contents of the `dist` directory to your web server.

## Technologies Used

- **System Utility**: Python (psutil, requests)
- **Backend Server**: Node.js, Express, MongoDB
- **Admin Dashboard**: React, Vite, Material-UI, Chart.js


