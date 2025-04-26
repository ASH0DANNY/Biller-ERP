// third-party
import { combineReducers } from 'redux';

// project-imports
import menu from './menu-reducer';
import snackbar from './snackbar-reducer';
import productsSlice from './product-reducer';
import bills from './bills-reducer';
import staff from './staff-reducer';
import credit from './credit-reducer';
import business from './business-reducer';

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  menu,
  snackbar,
  products: productsSlice,
  bills,
  staff,
  credit,
  business
});

export default reducers;
