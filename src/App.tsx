import { useEffect, useState } from 'react';

// project-imports
import Routes from 'routes';
import ThemeCustomization from 'themes';

import Loader from 'components/Loader';
import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

import { dispatch } from 'store/index-store';
import { fetchMenu } from 'store/reducers/menu-reducer';


import { FirebaseProvider as AuthProvider } from 'contexts/FirebaseContext';


// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    dispatch(fetchMenu()).then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <ThemeCustomization>
      <RTLLayout>
        <Locales>
          <ScrollTop>
            <AuthProvider>
              <>
                <Notistack>
                  <Routes />
                  <Snackbar />
                </Notistack>
              </>
            </AuthProvider>
          </ScrollTop>
        </Locales>
      </RTLLayout>
    </ThemeCustomization>
  );
};

export default App;
