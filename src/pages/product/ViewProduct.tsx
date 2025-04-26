import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchproduct, updateProduct, deleteProduct } from 'store/reducers/product-reducer';
import { productType, productCategories } from 'types/product';
import {
  Box,
  Card,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import { AppDispatch } from 'store/index-store';
import { useUserCategories } from 'hooks/useUserCategories';

const ViewProduct = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const userCategories = useUserCategories();
  const { productArray = [], loading = false, error = null } = useSelector((state: any) => state.products);

  // Search/filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [subCategory, setSubCategory] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Edit dialog state
  const [editData, setEditData] = useState<productType | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchproduct());
  }, [dispatch]);

  // Filtering logic
  const filteredProducts = productArray.filter((product: productType) => {
    if (category !== 'all' && product.category.categoryName !== category) return false;
    if (subCategory !== 'all' && product.category.subCategories[0] !== subCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        product.productName.toLowerCase().includes(s) ||
        String(product.productCode).toLowerCase().includes(s) ||
        product.category.categoryName.toLowerCase().includes(s) ||
        (product.dealerName && product.dealerName.toLowerCase().includes(s))
      );
    }
    return true;
  });

  // Pagination
  const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Edit handlers
  const handleEdit = (product: productType) => {
    setEditData(product);
    setOpen(true);
  };
  const handleSave = async () => {
    if (!editData) return;
    try {
      const updatePayload = {
        productName: editData.productName,
        category: {
          categoryName: editData.category.categoryName,
          subCategories: editData.category.subCategories
        },
        product_selling_price: Number(editData.product_selling_price),
        product_cost_price: Number(editData.product_cost_price),
        product_mrp_price: Number(editData.product_mrp_price),
        quantity: Number(editData.quantity),
        dealerName: editData.dealerName
      };
      await dispatch(updateProduct({ id: editData.product_id, data: updatePayload })).unwrap();
      setOpen(false);
      setEditData(null);
      dispatch(fetchproduct());
    } catch (error) {
      alert('Failed to update product. Please try again.');
    }
  };
  const handleDelete = async (product: productType) => {
    if (window.confirm(`Are you sure you want to delete ${product.productName}?`)) {
      await dispatch(deleteProduct(product.product_id));
      dispatch(fetchproduct());
    }
  };

  // Table pagination handlers
  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Subcategory options for selected category
  const subCategoryOptions = category !== 'all' ? productCategories.find((cat) => cat.category === category)?.subcategory || [] : [];

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, code, category, dealer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory('all');
                }}
              >
                <MenuItem value="all">All</MenuItem>
                {userCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Subcategory</InputLabel>
              <Select
                value={subCategory}
                label="Subcategory"
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={category === 'all'}
              >
                <MenuItem value="all">All</MenuItem>
                {subCategoryOptions.map((sub) => (
                  <MenuItem key={sub} value={sub}>
                    {sub}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => {
                setSearch('');
                setCategory('all');
                setSubCategory('all');
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Card>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Code</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subcategory</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dealer</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Selling Price</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cost Price</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>MRP</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product: productType) => (
                  <TableRow key={product.product_id}>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.productCode}</TableCell>
                    <TableCell>{product.category.categoryName}</TableCell>
                    <TableCell>{product.category.subCategories[0] || '-'}</TableCell>
                    <TableCell>{product.dealerName}</TableCell>
                    <TableCell>{product.product_selling_price}</TableCell>
                    <TableCell>{product.product_cost_price}</TableCell>
                    <TableCell>{product.product_mrp_price}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.quantity}
                        color={product.quantity <= 0 ? 'error' : product.quantity <= 10 ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(product)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(product)} size="small">
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
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
      {/* Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {editData && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Name"
                  value={editData.productName}
                  onChange={(e) => setEditData({ ...editData, productName: e.target.value })}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Code"
                  value={editData.productCode}
                  onChange={(e) => setEditData({ ...editData, productCode: e.target.value })}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editData.category.categoryName}
                    label="Category"
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        category: {
                          ...editData.category,
                          categoryName: e.target.value,
                          subCategories: []
                        }
                      })
                    }
                  >
                    {productCategories.map((cat) => (
                      <MenuItem key={cat.category} value={cat.category}>
                        {cat.category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    value={editData.category.subCategories[0] || ''}
                    label="Subcategory"
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        category: {
                          ...editData.category,
                          subCategories: [e.target.value]
                        }
                      })
                    }
                  >
                    {productCategories
                      .find((cat) => cat.category === editData.category.categoryName)
                      ?.subcategory.map((sub) => (
                        <MenuItem key={sub} value={sub}>
                          {sub}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Selling Price"
                  type="number"
                  value={editData.product_selling_price}
                  onChange={(e) => setEditData({ ...editData, product_selling_price: parseFloat(e.target.value) })}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Cost Price"
                  type="number"
                  value={editData.product_cost_price}
                  onChange={(e) => setEditData({ ...editData, product_cost_price: parseFloat(e.target.value) })}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="MRP"
                  type="number"
                  value={editData.product_mrp_price}
                  onChange={(e) => setEditData({ ...editData, product_mrp_price: parseFloat(e.target.value) })}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={editData.quantity}
                  onChange={(e) => setEditData({ ...editData, quantity: parseInt(e.target.value, 10) })}
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <TextField
                  label="Dealer Name"
                  value={editData.dealerName}
                  onChange={(e) => setEditData({ ...editData, dealerName: e.target.value })}
                  fullWidth
                  margin="dense"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewProduct;
