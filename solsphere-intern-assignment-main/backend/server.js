/**
 * System Health Monitor - Backend Server
 *
 * This server receives system health data from client utilities,
 * stores it in a database, and provides APIs for querying the data.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/system-monitor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define System Data Schema
const systemDataSchema = new mongoose.Schema({
  machine_id: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  os_type: {
    type: String,
    required: true,
    enum: ['Windows', 'Darwin', 'Linux']
  },
  os_version: {
    type: String,
    required: true
  },
  checks: {
    disk_encryption: {
      type: Boolean,
      required: true
    },
    os_updated: {
      type: Boolean,
      required: true
    },
    antivirus_active: {
      type: Boolean,
      required: true
    },
    sleep_settings_compliant: {
      type: Boolean,
      required: true
    }
  }
});

// Create model
const SystemData = mongoose.model('SystemData', systemDataSchema);

// API Routes

// Receive system data from clients
app.post('/api/system-data', async (req, res) => {
  try {
    const systemData = new SystemData(req.body);
    await systemData.save();
    console.log(`Received data from machine: ${req.body.machine_id}`);
    res.status(200).json({ message: 'Data received successfully' });
  } catch (error) {
    console.error('Error saving system data:', error);
    res.status(500).json({ error: 'Failed to save system data' });
  }
});

// Get all machines (latest data for each)
app.get('/api/machines', async (req, res) => {
  try {
    // Aggregate to get the latest record for each machine
    const machines = await SystemData.aggregate([
      {
        $sort: { machine_id: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$machine_id',
          latest_data: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latest_data' }
      }
    ]);

    res.status(200).json(machines);
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
});

// Get machine history
app.get('/api/machines/:id/history', async (req, res) => {
  try {
    const history = await SystemData.find({ machine_id: req.params.id })
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching machine history:', error);
    res.status(500).json({ error: 'Failed to fetch machine history' });
  }
});

// Filter machines by criteria
app.get('/api/machines/filter', async (req, res) => {
  try {
    const { os_type, has_issues } = req.query;

    // Build filter query
    const query = {};

    if (os_type) {
      query.os_type = os_type;
    }

    // Get latest data for each machine first
    let machines = await SystemData.aggregate([
      {
        $sort: { machine_id: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$machine_id',
          latest_data: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latest_data' }
      }
    ]);

    // Filter by issues if requested
    if (has_issues === 'true') {
      machines = machines.filter(machine =>
        !machine.checks.disk_encryption ||
        !machine.checks.os_updated ||
        !machine.checks.antivirus_active ||
        !machine.checks.sleep_settings_compliant
      );
    } else if (has_issues === 'false') {
      machines = machines.filter(machine =>
        machine.checks.disk_encryption &&
        machine.checks.os_updated &&
        machine.checks.antivirus_active &&
        machine.checks.sleep_settings_compliant
      );
    }

    // Apply OS type filter if it exists
    if (os_type) {
      machines = machines.filter(machine => machine.os_type === os_type);
    }

    res.status(200).json(machines);
  } catch (error) {
    console.error('Error filtering machines:', error);
    res.status(500).json({ error: 'Failed to filter machines' });
  }
});

// Export data as CSV
app.get('/api/export/csv', async (req, res) => {
  try {
    // Get latest data for each machine
    const machines = await SystemData.aggregate([
      {
        $sort: { machine_id: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$machine_id',
          latest_data: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latest_data' }
      }
    ]);

    // Create CSV file
    const csvFilePath = path.join(__dirname, 'exports', 'system_data.csv');

    // Ensure exports directory exists
    if (!fs.existsSync(path.join(__dirname, 'exports'))) {
      fs.mkdirSync(path.join(__dirname, 'exports'));
    }

    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'machine_id', title: 'Machine ID' },
        { id: 'timestamp', title: 'Last Updated' },
        { id: 'os_type', title: 'OS Type' },
        { id: 'os_version', title: 'OS Version' },
        { id: 'disk_encryption', title: 'Disk Encryption' },
        { id: 'os_updated', title: 'OS Updated' },
        { id: 'antivirus_active', title: 'Antivirus Active' },
        { id: 'sleep_settings_compliant', title: 'Sleep Settings Compliant' }
      ]
    });

    // Format data for CSV
    const records = machines.map(machine => ({
      machine_id: machine.machine_id,
      timestamp: new Date(machine.timestamp).toISOString(),
      os_type: machine.os_type,
      os_version: machine.os_version,
      disk_encryption: machine.checks.disk_encryption ? 'Yes' : 'No',
      os_updated: machine.checks.os_updated ? 'Yes' : 'No',
      antivirus_active: machine.checks.antivirus_active ? 'Yes' : 'No',
      sleep_settings_compliant: machine.checks.sleep_settings_compliant ? 'Yes' : 'No'
    }));

    await csvWriter.writeRecords(records);

    // Send file to client
    res.download(csvFilePath, 'system_data.csv', (err) => {
      if (err) {
        console.error('Error sending CSV file:', err);
      }

      // Delete file after sending
      fs.unlinkSync(csvFilePath);
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
