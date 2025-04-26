// project-imports
// import support from './support';
import users from './users';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: Array.isArray(users) ? users : [users]
};

export default menuItems;
