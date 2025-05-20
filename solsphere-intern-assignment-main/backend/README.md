# System Health Monitor - Backend Server

A Node.js/Express server that receives system health data from client utilities, stores it in a MongoDB database, and provides APIs for querying the data.

## Features

- RESTful API for receiving system data from client utilities
- MongoDB database for storing machine information
- Endpoints for querying and filtering data
- CSV export functionality

## Requirements

- Node.js 14+
- MongoDB

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/system-monitor
   NODE_ENV=development
   ```

## Usage

Start the server:

```
npm start
```

For development with auto-reload:

```
npm run dev
```

## API Endpoints

### POST /api/system-data
Receives system health data from client utilities.

Request body:
```json
{
  "machine_id": "unique-machine-id",
  "timestamp": "2025-05-19T12:00:00Z",
  "os_type": "Windows",
  "os_version": "10.0.19044",
  "checks": {
    "disk_encryption": true,
    "os_updated": false,
    "antivirus_active": true,
    "sleep_settings_compliant": true
  }
}
```

### GET /api/machines
Returns the latest data for all machines.

### GET /api/machines/:id/history
Returns the history of a specific machine.

### GET /api/machines/filter
Filters machines by criteria.

Query parameters:
- `os_type`: Filter by OS type (Windows, Darwin, Linux)
- `has_issues`: Filter by machines with issues (true/false)

### GET /api/export/csv
Exports machine data as a CSV file.

## Database Schema

The system data is stored in MongoDB with the following schema:

```javascript
{
  machine_id: String,
  timestamp: Date,
  os_type: String,
  os_version: String,
  checks: {
    disk_encryption: Boolean,
    os_updated: Boolean,
    antivirus_active: Boolean,
    sleep_settings_compliant: Boolean
  }
}
```

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request


