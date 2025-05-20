import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock

# Add parent directory to path to import system_monitor
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import system_monitor

class TestSystemHealthMonitor(unittest.TestCase):
    """Test cases for the SystemHealthMonitor class."""
    
    def setUp(self):
        """Set up test environment."""
        # Mock configuration to avoid file operations
        self.original_config = system_monitor.CONFIG.copy()
        system_monitor.CONFIG["machine_id_file"] = "test_machine_id.txt"
        system_monitor.CONFIG["last_state_file"] = "test_last_state.json"
        
        # Create test files
        with open(system_monitor.CONFIG["machine_id_file"], "w") as f:
            f.write("test-machine-id")
        
        # Mock platform.system() to return a consistent value
        self.platform_patcher = patch('platform.system', return_value='Windows')
        self.mock_platform = self.platform_patcher.start()
        
        # Create monitor instance
        self.monitor = system_monitor.SystemHealthMonitor()
    
    def tearDown(self):
        """Clean up after tests."""
        # Remove test files
        for file in [system_monitor.CONFIG["machine_id_file"], system_monitor.CONFIG["last_state_file"]]:
            if os.path.exists(file):
                os.remove(file)
        
        # Restore original configuration
        system_monitor.CONFIG = self.original_config
        
        # Stop patchers
        self.platform_patcher.stop()
    
    def test_get_machine_id(self):
        """Test that machine ID is correctly retrieved."""
        self.assertEqual(self.monitor._get_machine_id(), "test-machine-id")
    
    @patch('subprocess.run')
    def test_check_disk_encryption_windows(self, mock_run):
        """Test disk encryption check on Windows."""
        # Mock subprocess.run to return a successful BitLocker status
        mock_process = MagicMock()
        mock_process.stdout = "Protection On"
        mock_run.return_value = mock_process
        
        self.assertTrue(self.monitor.check_disk_encryption())
        mock_run.assert_called_once()
    
    @patch('subprocess.run')
    def test_check_os_updates_windows(self, mock_run):
        """Test OS updates check on Windows."""
        # Mock subprocess.run to return "No updates found"
        mock_process = MagicMock()
        mock_process.stdout = "No updates found"
        mock_run.return_value = mock_process
        
        self.assertTrue(self.monitor.check_os_updates())
        mock_run.assert_called_once()
    
    @patch('subprocess.run')
    def test_check_antivirus_windows(self, mock_run):
        """Test antivirus check on Windows."""
        # Mock subprocess.run to return True for antivirus
        mock_process = MagicMock()
        mock_process.stdout = "RealTimeProtectionEnabled\n-----------------------------\nTrue"
        mock_run.return_value = mock_process
        
        self.assertTrue(self.monitor.check_antivirus())
        mock_run.assert_called_once()
    
    @patch('subprocess.run')
    def test_check_sleep_settings_windows(self, mock_run):
        """Test sleep settings check on Windows."""
        # Mock subprocess.run to return compliant sleep settings
        mock_process = MagicMock()
        mock_process.stdout = "STANDBYIDLE AC Power 0x00000000 0x00000258"  # 600 seconds = 10 minutes
        mock_run.return_value = mock_process
        
        self.assertTrue(self.monitor.check_sleep_settings())
        mock_run.assert_called_once()
    
    def test_has_state_changed_true(self):
        """Test state change detection when state has changed."""
        # Set up last state
        self.monitor.last_state = {
            "checks": {
                "disk_encryption": True,
                "os_updated": True,
                "antivirus_active": True,
                "sleep_settings_compliant": True
            }
        }
        
        # Current state with a change
        current_state = {
            "checks": {
                "disk_encryption": True,
                "os_updated": False,  # Changed
                "antivirus_active": True,
                "sleep_settings_compliant": True
            }
        }
        
        self.assertTrue(self.monitor.has_state_changed(current_state))
    
    def test_has_state_changed_false(self):
        """Test state change detection when state has not changed."""
        # Set up last state
        self.monitor.last_state = {
            "checks": {
                "disk_encryption": True,
                "os_updated": True,
                "antivirus_active": True,
                "sleep_settings_compliant": True
            }
        }
        
        # Current state with no changes
        current_state = {
            "checks": {
                "disk_encryption": True,
                "os_updated": True,
                "antivirus_active": True,
                "sleep_settings_compliant": True
            }
        }
        
        self.assertFalse(self.monitor.has_state_changed(current_state))
    
    @patch('requests.post')
    def test_report_to_server_success(self, mock_post):
        """Test successful reporting to server."""
        # Mock successful response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response
        
        data = {"test": "data"}
        self.assertTrue(self.monitor.report_to_server(data))
        mock_post.assert_called_once()
    
    @patch('requests.post')
    def test_report_to_server_failure(self, mock_post):
        """Test failed reporting to server."""
        # Mock failed response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_post.return_value = mock_response
        
        data = {"test": "data"}
        self.assertFalse(self.monitor.report_to_server(data))
        mock_post.assert_called_once()

if __name__ == '__main__':
    unittest.main()
