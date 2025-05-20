import React, { useState } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import MachineList from './MachineList';
import SummaryCard from './SummaryCard';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ machines, loading, error }) => {
  const [osFilter, setOsFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter machines based on selected filters
  const filteredMachines = machines.filter(machine => {
    // OS filter
    if (osFilter !== 'all' && machine.os_type !== osFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      const hasIssues = !machine.checks.disk_encryption || 
                        !machine.checks.os_updated || 
                        !machine.checks.antivirus_active || 
                        !machine.checks.sleep_settings_compliant;
                        
      if (statusFilter === 'issues' && !hasIssues) {
        return false;
      }
      if (statusFilter === 'ok' && hasIssues) {
        return false;
      }
    }
    
    return true;
  });

  // Calculate summary statistics
  const totalMachines = machines.length;
  const machinesWithIssues = machines.filter(machine => 
    !machine.checks.disk_encryption || 
    !machine.checks.os_updated || 
    !machine.checks.antivirus_active || 
    !machine.checks.sleep_settings_compliant
  ).length;

  // Prepare OS distribution data for pie chart
  const osDistribution = {
    labels: ['Windows', 'macOS', 'Linux'],
    datasets: [
      {
        data: [
          machines.filter(m => m.os_type === 'Windows').length,
          machines.filter(m => m.os_type === 'Darwin').length,
          machines.filter(m => m.os_type === 'Linux').length
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Get the latest update timestamp
  const latestUpdate = machines.length > 0 
    ? new Date(Math.max(...machines.map(m => new Date(m.timestamp)))).toLocaleString()
    : 'No data';

  if (loading && machines.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && machines.length === 0) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading data: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Health Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Total Machines" 
            value={totalMachines} 
            icon="computer"
            color="#3f51b5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Machines with Issues" 
            value={machinesWithIssues} 
            icon="warning"
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Compliance Rate" 
            value={`${Math.round((totalMachines - machinesWithIssues) / totalMachines * 100)}%`} 
            icon="check_circle"
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard 
            title="Last Update" 
            value={latestUpdate} 
            icon="update"
            color="#ff9800"
          />
        </Grid>
      </Grid>
      
      {/* Filters and OS Distribution */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>OS Type</InputLabel>
                  <Select
                    value={osFilter}
                    label="OS Type"
                    onChange={(e) => setOsFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Windows">Windows</MenuItem>
                    <MenuItem value="Darwin">macOS</MenuItem>
                    <MenuItem value="Linux">Linux</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="issues">With Issues</MenuItem>
                    <MenuItem value="ok">OK</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {osFilter !== 'all' && (
                  <Chip label={`OS: ${osFilter}`} onDelete={() => setOsFilter('all')} />
                )}
                {statusFilter !== 'all' && (
                  <Chip 
                    label={`Status: ${statusFilter === 'issues' ? 'With Issues' : 'OK'}`} 
                    onDelete={() => setStatusFilter('all')} 
                  />
                )}
                {osFilter === 'all' && statusFilter === 'all' && (
                  <Typography variant="body2">No filters applied</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              OS Distribution
            </Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pie data={osDistribution} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Machine List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Machines
        </Typography>
        <MachineList machines={filteredMachines} />
      </Paper>
    </Box>
  );
};

export default Dashboard;
