// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DocumentCode2, I24Support, Driving, Add } from 'iconsax-react';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  samplePage: DocumentCode2,
  documentation: I24Support,
  roadmap: Driving,
  add: Add
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const support: NavItemType[] = [
  {
    id: 'create-new-bill',
    title: <FormattedMessage id="Create New Bill" />,
    type: 'group',
    url: '/billing',
    icon: icons.add,
    external: false,
    target: false,
    breadcrumbs: false,
    chip: {
      label: 'New',
      color: 'primary',
      size: 'small'
    }
  },
  {
    id: 'home',
    title: <FormattedMessage id="Home" />,
    type: 'group',
    children: [
      {
        id: 'dashboard',
        title: <FormattedMessage id="Dashboard" />,
        type: 'item',
        url: '/dashboard',
        icon: icons.roadmap,
        external: false,
        target: false
      },
      {
        id: 'my-bills',
        title: <FormattedMessage id="My Bills" />,
        type: 'item',
        url: '/my-bills',
        icon: icons.roadmap,
        external: false,
        target: false
      }
    ]
  },
  {
    id: 'product',
    title: <FormattedMessage id="Product" />,
    type: 'group',
    children: [
      {
        id: 'add-product',
        title: <FormattedMessage id="Add Product" />,
        type: 'item',
        url: '/add-product',
        icon: icons.roadmap,
        external: false,
        target: false
      },
      {
        id: 'view-product',
        title: <FormattedMessage id="View Product" />,
        type: 'item',
        url: '/view-product',
        icon: icons.roadmap,
        external: false,
        target: false
      },
      {
        id: 'printables',
        title: <FormattedMessage id="Printables" />,
        type: 'collapse',
        icon: icons.roadmap,
        children: [
          {
            id: 'barcode',
            title: <FormattedMessage id="Generate Barcode" />,
            type: 'item',
            url: '/printables/generate-barcode',
            icon: icons.roadmap,
            external: false,
            target: false
          },
          {
            id: 'tags',
            title: <FormattedMessage id="Generate Tags" />,
            type: 'item',
            url: '/printables/generate-tags',
            icon: icons.roadmap,
            external: false,
            target: false
          }
        ]
      }
    ]
  },

  {
    id: 'management',
    title: <FormattedMessage id="Management" />,
    type: 'group',
    children: [
      {
        id: 'stock-management',
        title: <FormattedMessage id="Stock Management" />,
        type: 'item',
        url: '/stock-management',
        icon: icons.roadmap,
        external: false,
        target: false
      },
      {
        id: 'credit-management',
        title: <FormattedMessage id="Credit Management" />,
        type: 'item',
        url: '/credit-management',
        icon: icons.roadmap,
        external: false,
        target: false
      },
      {
        id: 'staff-management',
        title: <FormattedMessage id="Staff Management" />,
        type: 'item',
        url: '/staff-management',
        icon: icons.roadmap,
        external: false,
        target: false
      }
    ]
  },

  {
    id: 'reports',
    title: <FormattedMessage id="Reports" />,
    type: 'group',
    children: [
      {
        id: 'reports',
        title: <FormattedMessage id="Reports" />,
        type: 'item',
        url: '/reports',
        icon: icons.documentation,
        external: false,
        target: false
      },
      {
        id: 'my-example',
        title: <FormattedMessage id="My Example" />,
        type: 'item',
        url: '/my-example',
        icon: icons.roadmap,
        external: false,
        target: false
      }
    ]
  },
  {
    id: 'settings',
    title: <FormattedMessage id="Settings" />,
    type: 'group',
    children: [
      {
        id: 'dashboard-settings',
        title: <FormattedMessage id="Dashboard Settings" />,
        type: 'item',
        url: '/settings/dashboard-settings',
        icon: icons.documentation,
        external: false,
        target: false
      },
      {
        id: 'report-settings',
        title: <FormattedMessage id="Report Settings" />,
        type: 'item',
        url: '/settings/report-settings',
        icon: icons.documentation,
        external: false,
        target: false
      }
    ]
  }
];

export default support;
