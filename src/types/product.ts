export type userSelectedCategoryType = {
  userID: string;
  selectedCategory: productCategoryType[];
};

export type productType = {
  product_id: string;
  productName: string;
  productCode: string;
  product_selling_price: number;
  product_cost_price: number;
  product_mrp_price: number;
  category: {
    categoryName: string;
    subCategories: string[]
  };
  quantity: number;
  dealerName: string;
  doc_id: string; // Added doc_id property
};

export type ProductSearchBarProps = {
  products: productType[];
  onProductSelect: (product: productType) => void;
  placeholder?: string;
  selectedCategory?: string;
}


export type productBarcodeType = {
  product_data: productType;
  product_size: string;
  product_color: string;
  product_weight: number;
};

export type productCategoryType = {
  category: string;
  subcategory: string[];
  prefix: string;
};

export const productCategories: productCategoryType[] = [
  {
    category: 'Etables',
    subcategory: [
      'Staple Foods',
      'Spices and Condiments',
      'Edible Oils and Ghee',
      'Beverages',
      'Snacks and Namkeen',
      'Dairy Products',
      'Packaged Foods',
    ],
    prefix: 'EAT',

  },
  {
    category: 'Clothes & Garments',
    subcategory: [
      'Men\'s Wear',
      'Women\'s Wear',
      'Kids\' Wear',
      'Winter Wear',
      'Traditional Wear'
    ],
    prefix: 'CLO',
  },
  {
    category: 'Electronics',
    subcategory: [
      'Mobile Phones',
      'Laptops',
      'Televisions',
      'Cameras',
      'Audio Systems'
    ],
    prefix: 'TEC',
  },
  {
    category: 'Werables',
    subcategory: [
      'Watches',
      'Fitness Bands',
      'Smartwatches',
      'Jewelry',
      'Accessories'
    ],
    prefix: 'WER',
  },
  {
    category: 'Furniture',
    subcategory: [
      'Living Room Furniture',
      'Bedroom Furniture',
      'Office Furniture',
      'Outdoor Furniture',
      'Storage Furniture'
    ],
    prefix: 'FUR',
  },
  {
    category: 'Kitchenware',
    subcategory: ['Household Cleaning Items',
      'Cookware',
      'Bakeware',
      'Kitchen Tools',
      'Tableware',
      'Storage Containers'
    ],
    prefix: 'KIT',
  },
  {
    category: 'Hardware & Bathware',
    subcategory: [
      'Toiletries',
      'Household Supplies',
      'Stationery',
      'Gardening Tools',
      'Bathroom Accessories',
      'Plumbing Supplies',
      'Electrical Supplies',
      'Paint and Painting Supplies'
    ],
    prefix: 'HAR',
  }
  ,
  {
    category: 'Personal Care Products',
    subcategory: ['Cosmetics',
      'Skin Care Products',
      'Hair Care Products',
      'Oral Care Products',
      'Fragrances',
      'Bath and Body Products',
      'Health and Wellness Products'
    ],
    prefix: 'PER',
  },



];
