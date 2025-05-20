import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';

const MachineList = ({ machines }) => {
  const [orderBy, setOrderBy] = useState('machine_id');
  const [order, setOrder] = useState('asc');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenDetails = (machine) => {
    setSelectedMachine(machine);
    setDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDialogOpen(false);
  };

  // Sort machines based on current sort settings
  const sortedMachines = [...machines].sort((a, b) => {
    let valueA, valueB;
    
    if (orderBy === 'machine_id' || orderBy === 'os_type' || orderBy === 'os_version') {
      valueA = a[orderBy];
      valueB = b[orderBy];
    } else if (orderBy === 'timestamp') {
      valueA = new Date(a[orderBy]);
      valueB = new Date(b[orderBy]);
    } else if (orderBy === 'status') {
      // Calculate status based on checks
      const aHasIssues = !a.checks.disk_encryption || 
                        !a.checks.os_updated || 
                        !a.checks.antivirus_active || 
                        !a.checks.sleep_settings_compliant;
      const bHasIssues = !b.checks.disk_encryption || 
                        !b.checks.os_updated || 
                        !b.checks.antivirus_active || 
                        !b.checks.sleep_settings_compliant;
      
      valueA = aHasIssues ? 1 : 0;
      valueB = bHasIssues ? 1 : 0;
    }
    
    if (valueA < valueB) {
      return order === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Format OS type for display
  const formatOsType = (osType) => {
    switch (osType) {
      case 'Windows':
        return 'Windows';
      case 'Darwin':
        return 'macOS';
      case 'Linux':
        return 'Linux';
      default:
        return osType;
    }
  };

  // Calculate overall status
  const getStatus = (checks) => {
    const hasIssues = !checks.disk_encryption || 
                      !checks.os_updated || 
                      !checks.antivirus_active || 
                      !checks.sleep_settings_compliant;
    
    return hasIssues ? 'Issues' : 'OK';
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'OK' ? 'success' : 'error';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="machine list">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'machine_id'}
                  direction={orderBy === 'machine_id' ? order : 'asc'}
                  onClick={() => handleRequestSort('machine_id')}
                >
                  Machine ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'os_type'}
                  direction={orderBy === 'os_type' ? order : 'asc'}
                  onClick={() => handleRequestSort('os_type')}
                >
                  OS
                </TableSortLabel>
              </TableCell>
              <TableCell>Disk Encryption</TableCell>
              <TableCell>OS Updated</TableCell>
              <TableCell>Antivirus</TableCell>
              <TableCell>Sleep Settings</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'timestamp'}
                  direction={orderBy === 'timestamp' ? order : 'asc'}
                  onClick={() => handleRequestSort('timestamp')}
                >
                  Last Check-in
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMachines.map((machine) => (
              <TableRow key={machine.machine_id}>
                <TableCell component="th" scope="row">
                  {machine.machine_id}
                </TableCell>
                <TableCell>
                  {formatOsType(machine.os_type)} {machine.os_version}
                </TableCell>
                <TableCell>
                  {machine.checks.disk_encryption ? 
                    <CheckCircleIcon color="success" /> : 
                    <CancelIcon color="error" />}
                </TableCell>
                <TableCell>
                  {machine.checks.os_updated ? 
                    <CheckCircleIcon color="success" /> : 
                    <CancelIcon color="error" />}
                </TableCell>
                <TableCell>
                  {machine.checks.antivirus_active ? 
                    <CheckCircleIcon color="success" /> : 
                    <CancelIcon color="error" />}
                </TableCell>
                <TableCell>
                  {machine.checks.sleep_settings_compliant ? 
                    <CheckCircleIcon color="success" /> : 
                    <CancelIcon color="error" />}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatus(machine.checks)} 
                    color={getStatusColor(getStatus(machine.checks))}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatTimestamp(machine.timestamp)}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDetails(machine)}
                    aria-label="view details"
                  >
                    <InfoIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {machines.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No machines found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Machine Details Dialog */}
      {selectedMachine && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Machine Details: {selectedMachine.machine_id}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">OS:</Typography>
                <Typography variant="body1" gutterBottom>
                  {formatOsType(selectedMachine.os_type)} {selectedMachine.os_version}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Last Check-in:</Typography>
                <Typography variant="body1" gutterBottom>
                  {formatTimestamp(selectedMachine.timestamp)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  System Checks
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {selectedMachine.checks.disk_encryption ? 
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : 
                      <CancelIcon color="error" sx={{ mr: 1 }} />}
                    <Typography variant="subtitle1">
                      Disk Encryption
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedMachine.checks.disk_encryption ? 
                      'Disk is encrypted and secure.' : 
                      'Disk is not encrypted. Enable disk encryption for better security.'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {selectedMachine.checks.os_updated ? 
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : 
                      <CancelIcon color="error" sx={{ mr: 1 }} />}
                    <Typography variant="subtitle1">
                      OS Updates
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedMachine.checks.os_updated ? 
                      'Operating system is up to date.' : 
                      'Operating system needs updates. Install latest updates for security.'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {selectedMachine.checks.antivirus_active ? 
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : 
                      <CancelIcon color="error" sx={{ mr: 1 }} />}
                    <Typography variant="subtitle1">
                      Antivirus
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedMachine.checks.antivirus_active ? 
                      'Antivirus protection is active and running.' : 
                      'No active antivirus detected. Install or enable antivirus software.'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {selectedMachine.checks.sleep_settings_compliant ? 
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : 
                      <CancelIcon color="error" sx={{ mr: 1 }} />}
                    <Typography variant="subtitle1">
                      Sleep Settings
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedMachine.checks.sleep_settings_compliant ? 
                      'Sleep settings are compliant (≤ 10 minutes).' : 
                      'Sleep timeout is too long. Set to 10 minutes or less.'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default MachineList;
