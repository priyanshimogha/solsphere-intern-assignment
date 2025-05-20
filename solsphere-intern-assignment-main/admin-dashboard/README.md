# System Health Monitor - Admin Dashboard

A React-based web UI for displaying system health data collected from client machines.

## Features

- Real-time display of system health data
- Filtering and sorting options
- Visual indicators for system issues
- Responsive design
- Machine details view
- OS distribution chart
- CSV export functionality

## Requirements

- Node.js 14+
- Backend API server running

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

## Usage

Start the development server:

```
npm run dev
```

Build for production:

```
npm run build
```

## Components

### App
The main application component that sets up routing and fetches data from the API.

### Dashboard
Displays summary cards, OS distribution chart, and the machine list.

### Header
Contains the application title, refresh button, and export CSV button.

### Sidebar
Navigation sidebar with links to different sections of the application.

### MachineList
Displays a table of machines with their health status and allows sorting and filtering.

### SummaryCard
Displays a summary statistic with an icon and title.

## API Integration

The dashboard integrates with the following API endpoints:

- `GET /api/machines` - Get all machines (latest data)
- `GET /api/export/csv` - Export data as CSV

## Technologies Used

- React
- Vite
- Material-UI
- Chart.js
- React Router

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request


