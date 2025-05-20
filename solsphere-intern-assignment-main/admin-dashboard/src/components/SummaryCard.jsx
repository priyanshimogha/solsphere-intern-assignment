import React from 'react';
import { Paper, Typography, Box, Icon } from '@mui/material';

const SummaryCard = ({ title, value, icon, color }) => {
  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: `4px solid ${color}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon sx={{ color, mr: 1 }}>{icon}</Icon>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
        {value}
      </Typography>
    </Paper>
  );
};

export default SummaryCard;
