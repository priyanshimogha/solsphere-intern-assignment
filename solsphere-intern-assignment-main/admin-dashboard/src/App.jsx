import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Box } from '@mui/material';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [open, setOpen] = useState(true);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Fetch machines data
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoading(true);
        // In a real app, this would be your API endpoint
        const response = await fetch('http://localhost:3000/api/machines');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMachines(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching machines:', error);
        setError(error.message);
        setLoading(false);

        // For demo purposes, set mock data if API is not available
        setMachines([
          {
            machine_id: 'machine-001',
            timestamp: new Date().toISOString(),
            os_type: 'Windows',
            os_version: '10.0.19044',
            checks: {
              disk_encryption: true,
              os_updated: false,
              antivirus_active: true,
              sleep_settings_compliant: true
            }
          },
          {
            machine_id: 'machine-002',
            timestamp: new Date().toISOString(),
            os_type: 'Darwin',
            os_version: '12.6',
            checks: {
              disk_encryption: true,
              os_updated: true,
              antivirus_active: true,
              sleep_settings_compliant: false
            }
          },
          {
            machine_id: 'machine-003',
            timestamp: new Date().toISOString(),
            os_type: 'Linux',
            os_version: '5.15.0-ubuntu',
            checks: {
              disk_encryption: false,
              os_updated: true,
              antivirus_active: false,
              sleep_settings_compliant: true
            }
          }
        ]);
      }
    };

    fetchMachines();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchMachines, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Header open={open} toggleDrawer={toggleDrawer} />
          <Sidebar open={open} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              mt: 8,
              ml: open ? 30 : 7,
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    machines={machines}
                    loading={loading}
                    error={error}
                  />
                }
              />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
