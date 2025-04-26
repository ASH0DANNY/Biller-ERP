import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  InputAdornment,
  Chip,
  Divider,
  ClickAwayListener
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { ProductSearchBarProps, productType } from 'types/product';

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  products,
  onProductSelect,
  placeholder = 'Search products...',
  selectedCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<productType[]>([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products
        .filter(
          (product) =>
            product.productName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedCategory ? product.category.categoryName === selectedCategory : true)
        )
        .slice(0, 8); // Limit results to avoid performance issues

      setFilteredProducts(filtered);
      setShowResults(true);
    } else {
      setFilteredProducts([]);
      setShowResults(false);
    }
  }, [searchQuery, products, selectedCategory]);

  const handleProductClick = (product: productType) => {
    onProductSelect(product);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleClickAway = () => {
    setShowResults(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={() => setShowResults(true)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />

        {showResults && filteredProducts.length > 0 && (
          <Paper
            sx={{
              position: 'absolute',
              width: '100%',
              maxHeight: '300px',
              overflowY: 'auto',
              mt: 0.5,
              zIndex: 1000,
              boxShadow: 3
            }}
          >
            <List dense disablePadding>
              {filteredProducts.map((product) => (
                <React.Fragment key={product.productCode}>
                  <ListItem button onClick={() => handleProductClick(product)}>
                    <ListItemText
                      primary={product.productName}
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {product.productCode}
                          </Typography>
                          <Chip label={`₹${product.product_selling_price}`} size="small" color="primary" variant="outlined" />
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {showResults && searchQuery && filteredProducts.length === 0 && (
          <Paper
            sx={{
              position: 'absolute',
              width: '100%',
              p: 2,
              mt: 0.5,
              zIndex: 1000
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No products found
            </Typography>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default ProductSearchBar;
