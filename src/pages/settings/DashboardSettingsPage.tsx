import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  FormControlLabel,
  Switch,
  Typography,
  Grid,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert
} from '@mui/material';
import MainCard from 'components/MainCard';
import SaveIcon from '@mui/icons-material/Save';
import { SelectChangeEvent } from '@mui/material/Select';
import { Snackbar } from '@mui/material';

const DashboardSettingsPage = () => {
  const [settings, setSettings] = useState({
    // Revenue Cards
    showTodayRevenue: true,
    showMonthlyRevenue: true,
    showTotalBills: true,
    // Stock Cards
    showLowStockCount: true,
    showOutOfStockCount: true,
    showTotalProducts: true,
    lowStockThreshold: 10,
    // Credit/Debit
    showCreditDebitSummary: true,
    showTotalParties: true,
    showTotalBalance: true,
    // Transaction Settings
    recentTransactionsCount: 5,
    refreshInterval: 5,
    defaultDateRange: '7days',
    // Display Order
    cardsOrder: ['revenue', 'stock', 'credit']
  });
  const [alert, setAlert] = useState<{ open: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    type: 'success'
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      // Show failure alert if no settings are found
      setAlert({
        open: true,
        message: `No saved settings found.`,
        type: 'error'
      });
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));

    // Show success alert
    setAlert({
      open: true,
      message: `Settings saved successfully!`,
      type: 'success'
    });
  };

  const handleCardsOrderChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    // Ensure value is always an array
    setSettings({
      ...settings,
      cardsOrder: typeof value === 'string' ? [value] : value
    });
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <MainCard title="Dashboard Settings">
          <Grid container spacing={3}>
            {/* Revenue Display Settings */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Revenue Display
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showTodayRevenue}
                        onChange={(e) => setSettings({ ...settings, showTodayRevenue: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Show Today's Revenue"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showMonthlyRevenue}
                        onChange={(e) => setSettings({ ...settings, showMonthlyRevenue: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Show Monthly Revenue"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showTotalBills}
                        onChange={(e) => setSettings({ ...settings, showTotalBills: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Show Total Bills"
                  />
                </Box>
              </Card>
            </Grid>

            {/* Stock Display Settings */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Stock Display
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showLowStockCount}
                        onChange={(e) => setSettings({ ...settings, showLowStockCount: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Show Low Stock Count"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showOutOfStockCount}
                        onChange={(e) => setSettings({ ...settings, showOutOfStockCount: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Show Out of Stock Count"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showTotalProducts}
                        onChange={(e) => setSettings({ ...settings, showTotalProducts: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Show Total Products"
                  />
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>Low Stock Threshold</Typography>
                    <Slider
                      value={settings.lowStockThreshold}
                      onChange={(_, value) => setSettings({ ...settings, lowStockThreshold: value as number })}
                      marks
                      min={5}
                      max={50}
                      step={5}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Credit/Debit Display Settings */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Credit/Debit Display
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showCreditDebitSummary}
                        onChange={(e) => setSettings({ ...settings, showCreditDebitSummary: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Show Credit/Debit Summary"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showTotalParties}
                        onChange={(e) => setSettings({ ...settings, showTotalParties: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Show Total Parties"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showTotalBalance}
                        onChange={(e) => setSettings({ ...settings, showTotalBalance: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Show Total Balance"
                  />
                </Box>
              </Card>
            </Grid>

            {/* Data Settings */}
            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Data Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography gutterBottom>Recent Transactions Count</Typography>
                      <Slider
                        value={settings.recentTransactionsCount}
                        onChange={(_, value) => setSettings({ ...settings, recentTransactionsCount: value as number })}
                        marks
                        min={5}
                        max={20}
                        step={5}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Default Date Range</InputLabel>
                      <Select
                        value={settings.defaultDateRange}
                        label="Default Date Range"
                        onChange={(e) => setSettings({ ...settings, defaultDateRange: e.target.value })}
                      >
                        <MenuItem value="7days">Last 7 Days</MenuItem>
                        <MenuItem value="30days">Last 30 Days</MenuItem>
                        <MenuItem value="90days">Last 90 Days</MenuItem>
                        <MenuItem value="custom">Custom Range</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Auto Refresh Interval</InputLabel>
                      <Select
                        value={settings.refreshInterval}
                        label="Auto Refresh Interval"
                        onChange={(e) => setSettings({ ...settings, refreshInterval: e.target.value as number })}
                      >
                        <MenuItem value={1}>Every 1 minute</MenuItem>
                        <MenuItem value={5}>Every 5 minutes</MenuItem>
                        <MenuItem value={15}>Every 15 minutes</MenuItem>
                        <MenuItem value={30}>Every 30 minutes</MenuItem>
                        <MenuItem value={0}>Manual refresh only</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Display Order */}
            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Display Order
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="cards-order-label">Display Order</InputLabel>
                  <Select
                    labelId="cards-order-label"
                    multiple
                    value={settings.cardsOrder || []}
                    onChange={handleCardsOrderChange}
                    label="Display Order"
                    renderValue={(selected) => (selected as string[]).join(', ')}
                  >
                    <MenuItem value="revenue">Revenue Section</MenuItem>
                    <MenuItem value="stock">Stock Section</MenuItem>
                    <MenuItem value="credit">Credit/Debit Section</MenuItem>
                  </Select>
                </FormControl>
              </Card>
            </Grid>
          </Grid>

          {/* Save Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </Box>
        </MainCard>
      </Box>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.type} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DashboardSettingsPage;
