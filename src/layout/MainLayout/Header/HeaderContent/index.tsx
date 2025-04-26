
// material-ui
import { Theme } from '@mui/material/styles';
import { Box, useMediaQuery } from '@mui/material';

// project-imports
import Search from './Search';
import Profile from './Profile';
import MobileSection from './MobileSection';
import Notification from './Notification'
import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/MainLayout/Drawer/DrawerHeader';

// type
import { MenuOrientation } from 'types/config';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {!downLG && <Search />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}
      <Notification />
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
};

export default HeaderContent;
