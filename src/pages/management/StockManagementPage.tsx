import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchproduct, updateProductStock } from '../../store/reducers/product-reducer';
import { productType, productCategories } from 'types/product';
import { StockActionType, StockFilterOptions } from 'types/management-types/stock_manage';

// Material UI imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import InventoryIcon from '@mui/icons-material/Inventory';
import { AppDispatch } from 'store/index-store';

// Define types for RootState to use with useSelector
interface RootState {
  products: {
    productArray: productType[];
    loading: boolean;
    error: string | null;
  };
}

const StockManagementPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const productsState = useSelector((state: RootState) => state.products);
  const { productArray = [], loading = false, error = null } = productsState || {};

  // Local state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [openAdjustDialog, setOpenAdjustDialog] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<productType | null>(null);
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [actionType, setActionType] = useState<StockActionType>(StockActionType.ADD);
  const [filters, setFilters] = useState<StockFilterOptions>({
    category: 'all',
    stockStatus: 'all',
    sortBy: 'name',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchproduct());
  }, [dispatch]);

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle opening the stock adjustment dialog
  const handleOpenAdjustDialog = (product: productType, type: StockActionType) => {
    setSelectedProduct(product);
    setActionType(type);
    setQuantityChange(0);
    setReason('');
    setOpenAdjustDialog(true);
  };

  // Handle closing the stock adjustment dialog
  const handleCloseAdjustDialog = () => {
    setOpenAdjustDialog(false);
    setSelectedProduct(null);
  };

  // Handle stock adjustment confirmation
  const handleStockAdjustment = () => {
    if (!selectedProduct || quantityChange <= 0) return;

    // For REMOVE action, we need to send a positive quantity to remove
    // For ADD action, we need to send a negative quantity (as the updateProductStock function subtracts from current)
    const adjustmentQuantity = actionType === StockActionType.REMOVE ? quantityChange : -quantityChange;

    // Update product stock in Redux/Firebase
    dispatch(
      updateProductStock([
        {
          productCode: selectedProduct.productCode,
          quantity: adjustmentQuantity
        }
      ])
    );

    // Clear the dialog and state after dispatch
    handleCloseAdjustDialog();
  };

  // Handle category filter change
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setFilters({ ...filters, category: event.target.value });
  };

  // Handle stock status filter change
  const handleStockStatusChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilters({ ...filters, stockStatus: value as 'all' | 'low' | 'out' | 'normal' });
  };

  // Handle sort by change
  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilters({ ...filters, sortBy: value as 'name' | 'quantity' | 'recent' });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      stockStatus: 'all',
      sortBy: 'name',
      searchTerm: ''
    });
    setShowFilters(false);
  };

  // Filter and sort products
  const filteredProducts = productArray
    .filter((product) => {
      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        if (product.category.categoryName !== filters.category) {
          return false;
        }
      }

      // Apply stock status filter
      if (filters.stockStatus === 'out' && product.quantity > 0) {
        return false;
      } else if (filters.stockStatus === 'low' && product.quantity > 10) {
        return false;
      } else if (filters.stockStatus === 'normal' && product.quantity <= 10) {
        return false;
      }

      // Apply search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          product.productName?.toLowerCase().includes(searchLower) ||
          String(product.productCode).toLowerCase().includes(searchLower) ||
          product.dealerName?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (filters.sortBy === 'name') {
        return a.productName.localeCompare(b.productName);
      } else if (filters.sortBy === 'quantity') {
        return a.quantity - b.quantity;
      }
      return 0;
    });

  // Get stock status color
  const getStockStatusColor = (quantity: number) => {
    if (quantity <= 0) {
      return theme.palette.error.main;
    } else if (quantity <= 10) {
      return theme.palette.warning.main;
    }
    return theme.palette.success.main;
  };

  // Get stock status icon
  const getStockStatusIcon = (quantity: number) => {
    if (quantity <= 0) {
      return <ErrorIcon fontSize="small" />;
    } else if (quantity <= 10) {
      return <WarningIcon fontSize="small" />;
    }
    return <CheckCircleIcon fontSize="small" />;
  };

  // Get stock status text
  const getStockStatusText = (quantity: number) => {
    if (quantity <= 0) {
      return 'Out of Stock';
    } else if (quantity <= 10) {
      return 'Low Stock';
    }
    return 'In Stock';
  };

  // Statistics data
  const totalProducts = productArray.length;
  const outOfStockProducts = productArray.filter((p) => p.quantity <= 0).length;
  const lowStockProducts = productArray.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
  const inStockProducts = totalProducts - outOfStockProducts - lowStockProducts;

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.primary.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Total Products
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.success.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  In Stock
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {inStockProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.warning.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Low Stock
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {lowStockProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.error.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ErrorIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Out of Stock
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {outOfStockProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search products by name, code or dealer"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} md={5}>
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setShowFilters(!showFilters)} fullWidth>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
          <Grid item xs={6} md={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Refresh Product List">
              <IconButton onClick={() => dispatch(fetchproduct())} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        {showFilters && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={filters.category || 'all'} onChange={handleCategoryChange} label="Category">
                    <MenuItem value="all">All Categories</MenuItem>
                    {productCategories.map((cat) => (
                      <MenuItem key={cat.category} value={cat.category}>
                        {cat.category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Stock Status</InputLabel>
                  <Select value={filters.stockStatus || 'all'} onChange={handleStockStatusChange} label="Stock Status">
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="out">Out of Stock</MenuItem>
                    <MenuItem value="low">Low Stock</MenuItem>
                    <MenuItem value="normal">In Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select value={filters.sortBy || 'name'} onChange={handleSortByChange} label="Sort By">
                    <MenuItem value="name">Product Name</MenuItem>
                    <MenuItem value="quantity">Quantity (Low to High)</MenuItem>
                    <MenuItem value="recent">Recently Added</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" size="small" onClick={handleResetFilters} startIcon={<CancelIcon />}>
                Reset Filters
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Products Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product Code</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dealer</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading products...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <ErrorOutlineIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                    <Typography>No products found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => (
                  <TableRow
                    key={product.product_id}
                    sx={{
                      '&:hover': { bgcolor: theme.palette.action.hover },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {product.productName}
                      </Typography>
                    </TableCell>
                    <TableCell>{product.productCode}</TableCell>
                    <TableCell>{product.category.categoryName}</TableCell>
                    <TableCell>{product.dealerName}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStockStatusIcon(product.quantity)}
                        label={getStockStatusText(product.quantity)}
                        sx={{
                          backgroundColor: `${getStockStatusColor(product.quantity)}20`,
                          color: getStockStatusColor(product.quantity),
                          borderColor: getStockStatusColor(product.quantity),
                          borderRadius: 1
                        }}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Add Stock">
                          <IconButton color="primary" onClick={() => handleOpenAdjustDialog(product, StockActionType.ADD)} size="small">
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Stock">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenAdjustDialog(product, StockActionType.REMOVE)}
                            size="small"
                            disabled={product.quantity <= 0}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Stock Adjustment Dialog */}
      <Dialog open={openAdjustDialog} onClose={handleCloseAdjustDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          {actionType === StockActionType.ADD ? 'Add Stock' : 'Remove Stock'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedProduct && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6">{selectedProduct.productName}</Typography>
              <Typography variant="subtitle2" color="textSecondary">
                {selectedProduct.productCode}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Current Stock
                  </Typography>
                  <Typography variant="h6">{selectedProduct.quantity} units</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    After Adjustment
                  </Typography>
                  <Typography variant="h6">
                    {actionType === StockActionType.ADD
                      ? selectedProduct.quantity + Number(quantityChange || 0)
                      : Math.max(0, selectedProduct.quantity - Number(quantityChange || 0))}{' '}
                    units
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                type="number"
                label="Quantity to adjust"
                value={quantityChange}
                onChange={(e) => {
                  const value = Math.max(0, parseInt(e.target.value) || 0);
                  setQuantityChange(value);
                }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Reason for adjustment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                multiline
                rows={2}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAdjustDialog} color="inherit" startIcon={<CancelIcon />} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleStockAdjustment}
            variant="contained"
            color={actionType === StockActionType.ADD ? 'primary' : 'error'}
            disabled={!quantityChange || (actionType === StockActionType.REMOVE && (selectedProduct?.quantity || 0) < quantityChange)}
            startIcon={<SaveIcon />}
          >
            {actionType === StockActionType.ADD ? 'Add Stock' : 'Remove Stock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockManagementPage;
