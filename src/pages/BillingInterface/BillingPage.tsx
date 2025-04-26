import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  IconButton,
  MenuItem,
  FormControl,
  Select,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Remove, Delete, QrCodeScanner } from '@mui/icons-material';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { productType } from '../../types/product';
import { Bill } from '../../types/bills';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createBill } from 'store/reducers/bills-reducer';
import { AppDispatch, RootState } from '../../store/index-store';
import { Result } from '@zxing/library';
import { fetchproduct } from 'store/reducers/product-reducer';
import { useUserCategories } from 'hooks/useUserCategories';
import ProductSearchBar from 'components/search/ProductSearchBar';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import GenerateBillPrint from '../../utils/pdf-excel/GenerateBillPrint';

interface BillItemExtended extends productType {
  quantity: number;
  totalPrice: number;
}

const BillingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [billItems, setBillItems] = useState<BillItemExtended[]>([]);
  const [openScanner, setOpenScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [total, setTotal] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const navigate = useNavigate();
  const productData = useSelector((state: { products: { productArray: productType[] } }) => state.products.productArray);
  const userCategories = useUserCategories();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [alert, setAlert] = useState<{ open: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    type: 'success'
  });
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const business = useSelector((state: RootState) => state.business.businessDetails);

  useEffect(() => {
    if (productData.length === 0) {
      dispatch(fetchproduct());
    }
  }, [dispatch, productData.length]);

  const calculateTotals = (items: BillItemExtended[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.18; // 18% GST
    setTotal({
      subtotal,
      tax,
      total: subtotal + tax
    });
  };

  const handleBarcodeSubmit = useCallback(
    async (code: string): Promise<void> => {
      if (!code) {
        setScanError('Invalid barcode');
        return;
      }
      try {
        // Check if the product is already in the bill
        const existingItem = billItems.find((item) => item.productCode === code);

        if (existingItem) {
          // Update quantity if product exists
          const updatedItems = billItems.map((item) => {
            if (item.productCode === code) {
              return {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.product_selling_price
              };
            }
            return item;
          });
          setBillItems(updatedItems);
          calculateTotals(updatedItems);
        } else {
          // Find product in productData
          const product = productData.find((p) => p.productCode === code);
          if (product) {
            // Check if we have enough stock
            if (product.quantity < 1) {
              setAlert({
                open: true,
                message: `${product.productName} is out of stock`,
                type: 'warning'
              });
              return;
            }

            const newItem: BillItemExtended = {
              ...product,
              quantity: 1,
              totalPrice: product.product_selling_price
            };
            const newItems = [...billItems, newItem];
            setBillItems(newItems);
            calculateTotals(newItems);
          } else {
            setScanError('Product not found');
          }
        }
        setBarcodeInput('');
      } catch (error) {
        console.error('Error fetching product:', error);
        setScanError(error instanceof Error ? error.message : 'Error fetching product');
      }
    },
    [billItems, productData]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleBarcodeSubmit(barcodeInput);
    }
  };

  const handleScannerUpdate = (err: unknown, result?: Result): void => {
    if (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setScanError('Camera permission was denied');
        } else if (err.name === 'NotFoundError') {
          setScanError('No camera found');
        } else {
          console.warn('Scan error:', err);
        }
      }
      return;
    }
    if (result) {
      handleBarcodeSubmit(result.getText());
      setOpenScanner(false);
    }
  };

  const updateItemQuantity = (code: string, change: number) => {
    const updatedItems = billItems.map((item) => {
      if (item.productCode === code) {
        // Get current product stock
        const product = productData.find((p) => p.productCode === code);

        if (change > 0 && product && item.quantity >= product.quantity) {
          // Can't add more than what's in stock
          setAlert({
            open: true,
            message: `Cannot add more. Only ${product.quantity} available in stock.`,
            type: 'warning'
          });
          return item;
        }

        const newQuantity = Math.max(1, item.quantity + change);
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.product_selling_price
        };
      }
      return item;
    });
    setBillItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const removeItem = (code: string) => {
    const updatedItems = billItems.filter((item) => item.productCode !== code);
    setBillItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPaymentMethod(e.target.value as 'cash' | 'card' | 'upi');
  };

  // New function to update product stock in Firestore
  const updateProductStockInDb = async (stockUpdates: { productId: string; quantity: number }[]) => {
    try {
      // Create an array of promises for each stock update
      const updatePromises = stockUpdates.map(async (update) => {
        // Get the product data
        const product = productData.find((p) => p.productCode === update.productId);

        if (!product) {
          console.error(`Product with code ${update.productId} not found`);
          return Promise.reject(`Product with code ${update.productId} not found`);
        }

        // Calculate new quantity
        const newQuantity = Math.max(0, product.quantity - update.quantity);

        // Update in Firestore using doc_id
        const productRef = doc(db, 'products', product.product_id);
        return updateDoc(productRef, { quantity: newQuantity });
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Refresh product data
      dispatch(fetchproduct());

      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  };

  const handleProcessPayment = async () => {
    try {
      const billItemsData = billItems.map((item) => ({
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        price: item.product_selling_price,
        totalPrice: item.totalPrice
      }));

      // Check if any product doesn't have enough stock
      const insufficientStockItems = billItems.filter((item) => {
        const product = productData.find((p) => p.productCode === item.productCode);
        return product && product.quantity < item.quantity;
      });

      if (insufficientStockItems.length > 0) {
        const itemNames = insufficientStockItems.map((item) => item.productName).join(', ');
        setAlert({
          open: true,
          message: `Insufficient stock for: ${itemNames}`,
          type: 'error'
        });
        return;
      }

      const newBill: Bill = {
        billId: `BILL-${Date.now()}`,
        date: new Date().toISOString(),
        items: billItemsData,
        subtotal: total.subtotal,
        tax: total.tax,
        total: total.total,
        customerName,
        customerPhone,
        paymentMethod
      };

      // Create bill first
      await dispatch(createBill(newBill)).unwrap();

      // Then update product stock in Firestore directly
      const stockUpdates = billItems.map((item) => ({
        productId: item.productCode,
        quantity: item.quantity
      }));
      await updateProductStockInDb(stockUpdates);

      // Set current bill and open print dialog
      setCurrentBill(newBill);
      setPrintDialogOpen(true);

      // Clear bill items and customer info
      setBillItems([]);
      setCustomerName('');
      setCustomerPhone('');

      setAlert({
        open: true,
        message: 'Bill created successfully and stock updated',
        type: 'success'
      });

      // Don't navigate away immediately, let the user print first
      setTimeout(() => {
        navigate('/my-bills');
      }, 3000);
    } catch (error) {
      console.error('Error saving bill:', error);
      setAlert({
        open: true,
        message: 'Error processing payment',
        type: 'error'
      });
    }
  };

  const handleProductSelect = (product: productType) => {
    const existingItem = billItems.find((item) => item.productCode === product.productCode);

    // Check if product is in stock
    if (product.quantity <= 0) {
      setAlert({
        open: true,
        message: `${product.productName} is out of stock`,
        type: 'warning'
      });
      return;
    }

    if (existingItem) {
      // Check if we have enough stock to add one more
      if (existingItem.quantity >= product.quantity) {
        setAlert({
          open: true,
          message: `Cannot add more ${product.productName}. Only ${product.quantity} available in stock.`,
          type: 'warning'
        });
        return;
      }

      // Update quantity if product exists
      const updatedItems = billItems.map((item) => {
        if (item.productCode === product.productCode) {
          return {
            ...item,
            quantity: item.quantity + 1,
            totalPrice: (item.quantity + 1) * item.product_selling_price
          };
        }
        return item;
      });
      setBillItems(updatedItems);
      calculateTotals(updatedItems);
    } else {
      // Add new item to bill
      const newItem: BillItemExtended = {
        ...product,
        quantity: 1,
        totalPrice: product.product_selling_price
      };
      const newItems = [...billItems, newItem];
      setBillItems(newItems);
      calculateTotals(newItems);
    }
  };

  const filteredProducts = productData.filter((product) => selectedCategory === '' || product.category.categoryName === selectedCategory);

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Barcode Scanner and Search Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flexGrow: 1 }}>
                <ProductSearchBar
                  products={productData}
                  onProductSelect={handleProductSelect}
                  placeholder="Search products by name..."
                  selectedCategory={selectedCategory}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Scan Barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  sx={{ width: { xs: '100%', md: '200px' } }}
                />
                <Button variant="contained" startIcon={<QrCodeScanner />} onClick={() => setOpenScanner(true)}>
                  Scan
                </Button>
              </Box>
              <FormControl sx={{ width: { xs: '100%', md: '200px' } }}>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as string)}
                  displayEmpty
                  renderValue={(selected) => (selected === '' ? 'All Categories' : selected)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {userCategories.map((categoryName) => (
                    <MenuItem key={categoryName} value={categoryName}>
                      {categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Products Table */}
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Stock</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billItems.map((item) => {
                    const product = productData.find((p) => p.productCode === item.productCode);
                    const availableStock = product ? product.quantity : 0;

                    return (
                      <TableRow key={item.productCode}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">₹{item.product_selling_price}</TableCell>
                        <TableCell align="center">{availableStock}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => updateItemQuantity(item.productCode, -1)} disabled={item.quantity <= 1}>
                            <Remove />
                          </IconButton>
                          {item.quantity}
                          <IconButton onClick={() => updateItemQuantity(item.productCode, 1)} disabled={item.quantity >= availableStock}>
                            <Add />
                          </IconButton>
                        </TableCell>
                        <TableCell align="right">₹{item.totalPrice}</TableCell>
                        <TableCell align="center">
                          <IconButton color="error" onClick={() => removeItem(item.productCode)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Product Selection */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, maxHeight: '400px', overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Quick Select Products
              </Typography>
              <Grid container spacing={1}>
                {filteredProducts.slice(0, 30).map((product) => (
                  <Grid item xs={6} sm={4} key={product.productCode}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleProductSelect(product)}
                      disabled={product.quantity <= 0}
                      sx={{
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        padding: '4px',
                        marginBottom: '4px',
                        opacity: product.quantity <= 0 ? 0.5 : 1
                      }}
                    >
                      {product.productName} {product.quantity <= 0 ? '(Out of stock)' : `(${product.quantity})`}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Billing Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Bill Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Customer Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField select fullWidth label="Payment Method" value={paymentMethod} onChange={handlePaymentMethodChange}>
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="upi">UPI</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">₹{total.subtotal.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>GST (18%):</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">₹{total.tax.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right">
                      ₹{total.total.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleProcessPayment}
                      disabled={billItems.length === 0}
                    >
                      Process Payment
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Barcode Scanner Dialog */}
        <Dialog open={openScanner} onClose={() => setOpenScanner(false)} maxWidth="sm" fullWidth>
          {scanError ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">{scanError}</Typography>
              <Button onClick={() => setOpenScanner(false)}>Close</Button>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <BarcodeScannerComponent width="100%" height={300} onUpdate={handleScannerUpdate} />
              <Button fullWidth variant="contained" onClick={() => setOpenScanner(false)} sx={{ mt: 2 }}>
                Close Scanner
              </Button>
            </Box>
          )}
        </Dialog>

        {/* Alert Snackbar */}
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={() => setAlert({ ...alert, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.type} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} fullScreen onClose={() => setPrintDialogOpen(false)}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }} className="no-print">
          <Button variant="contained" onClick={() => setPrintDialogOpen(false)} sx={{ ml: 1 }}>
            Close
          </Button>
        </Box>
        {currentBill && <GenerateBillPrint bill={currentBill} businessDetails={business} />}
      </Dialog>
    </>
  );
};

export default BillingPage;
