// material-ui
import { Stack, Typography } from '@mui/material';

// ==============================|| MAIN LAYOUT - FOOTER ||============================== //

const Footer = () => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: '24px 16px 0px', mt: 'auto' }}>
    <Typography variant="caption">
      &copy; {process.env.REACT_APP_NAME} ♥ crafted by Team {process.env.REACT_APP_DEV_TEAM_NAME}
    </Typography>
  </Stack>
);

export default Footer;
