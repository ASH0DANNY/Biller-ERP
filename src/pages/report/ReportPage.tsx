// const ReportPage = () => {
//   return <div>ReportPage</div>;
// };

// export default ReportPage;

import { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { PictureAsPdf as PdfIcon, TableChart as ExcelIcon } from '@mui/icons-material';
import { generateAllProductsPDF } from 'utils/pdf-excel/GenerateAllProductsPDF';
import { generateAllProductsExcel } from 'utils/pdf-excel/GenerateAllProductsExcel';
import { useSelector } from 'react-redux';
import { RootState } from 'store/index-store';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { productType } from 'types/product';

const ReportPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('inventory');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card' | 'upi'>('all');

  const products = useSelector((state: RootState) => state.products.productArray);
  const bills = useSelector((state: RootState) => state.bills.bills);
  const creditTransactions = useSelector((state: RootState) => state.credit.transactions);

  const filterBillsByDate = <T extends { date: string }>(items: T[], start: Date | null, end: Date | null): T[] => {
    if (!start || !end) return items;
    return items.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });
  };

  const reportCategories = [
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'View complete inventory status with stock levels and pricing',
      pdfHandler: () => {
        const columns = [
          { title: 'Code', field: 'productCode' },
          { title: 'Name', field: 'productName' },
          { title: 'Category', field: 'category.categoryName' },
          { title: 'Stock', field: 'quantity' },
          { title: 'Cost Price', field: 'product_cost_price' },
          { title: 'Selling Price', field: 'product_selling_price' },
          { title: 'MRP', field: 'product_mrp_price' }
        ];
        generateAllProductsPDF(columns, products);
      },
      excelHandler: () => {
        const columns = [
          { title: 'Code', field: 'productCode' },
          { title: 'Name', field: 'productName' },
          { title: 'Category', field: 'category.categoryName' },
          { title: 'Stock', field: 'quantity' },
          { title: 'Cost Price', field: 'product_cost_price' },
          { title: 'Selling Price', field: 'product_selling_price' },
          { title: 'MRP', field: 'product_mrp_price' }
        ];
        generateAllProductsExcel(columns, products);
      }
    },
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'View detailed sales analysis with payment methods and totals',
      pdfHandler: () => {
        const filteredBills = filterBillsByDate(bills, dateRange.start, dateRange.end).filter(
          (bill) => paymentFilter === 'all' || bill.paymentMethod === paymentFilter
        );
        const columns = [
          { title: 'Bill ID', field: 'billId' },
          { title: 'Date', field: 'date' },
          { title: 'Customer', field: 'customerName' },
          { title: 'Payment', field: 'paymentMethod' },
          { title: 'Subtotal', field: 'subtotal' },
          { title: 'Tax', field: 'tax' },
          { title: 'Total', field: 'total' }
        ];
        generateAllProductsPDF(columns, filteredBills);
      },
      excelHandler: () => {
        const filteredBills = filterBillsByDate(bills, dateRange.start, dateRange.end).filter(
          (bill) => paymentFilter === 'all' || bill.paymentMethod === paymentFilter
        );
        const columns = [
          { title: 'Bill ID', field: 'billId' },
          { title: 'Date', field: 'date' },
          { title: 'Customer', field: 'customerName' },
          { title: 'Payment', field: 'paymentMethod' },
          { title: 'Subtotal', field: 'subtotal' },
          { title: 'Tax', field: 'tax' },
          { title: 'Total', field: 'total' }
        ];
        generateAllProductsExcel(columns, filteredBills);
      }
    },
    {
      id: 'stock',
      title: 'Stock Alert Report',
      description: 'Monitor low stock and out-of-stock products',
      pdfHandler: () => {
        const lowStockProducts = products.filter((product: productType) => product.quantity <= 5);
        const columns = [
          { title: 'Code', field: 'productCode' },
          { title: 'Name', field: 'productName' },
          { title: 'Category', field: 'category.categoryName' },
          { title: 'Current Stock', field: 'quantity' },
          { title: 'Status', field: 'status', render: (product: productType) => (product.quantity === 0 ? 'Out of Stock' : 'Low Stock') }
        ];
        generateAllProductsPDF(columns, lowStockProducts);
      },
      excelHandler: () => {
        const lowStockProducts = products.filter((product: productType) => product.quantity <= 5);
        const columns = [
          { title: 'Code', field: 'productCode' },
          { title: 'Name', field: 'productName' },
          { title: 'Category', field: 'category.categoryName' },
          { title: 'Current Stock', field: 'quantity' },
          { title: 'Status', field: 'status', render: (product: productType) => (product.quantity === 0 ? 'Out of Stock' : 'Low Stock') }
        ];
        generateAllProductsExcel(columns, lowStockProducts);
      }
    },
    {
      id: 'credit',
      title: 'Credit/Debit Report',
      description: 'View credit and debit transactions history',
      pdfHandler: () => {
        const filteredTransactions = filterBillsByDate(creditTransactions, dateRange.start, dateRange.end);
        const columns = [
          { title: 'Date', field: 'date' },
          { title: 'Party', field: 'partyName' },
          { title: 'Type', field: 'type' },
          { title: 'Amount', field: 'amount' },
          { title: 'Description', field: 'description' },
          { title: 'Bill Number', field: 'billNumber' }
        ];
        generateAllProductsPDF(columns, filteredTransactions);
      },
      excelHandler: () => {
        const filteredTransactions = filterBillsByDate(creditTransactions, dateRange.start, dateRange.end);
        const columns = [
          { title: 'Date', field: 'date' },
          { title: 'Party', field: 'partyName' },
          { title: 'Type', field: 'type' },
          { title: 'Amount', field: 'amount' },
          { title: 'Description', field: 'description' },
          { title: 'Bill Number', field: 'billNumber' }
        ];
        generateAllProductsExcel(columns, filteredTransactions);
      }
    }
  ];

  const showDateFilter = ['sales', 'credit'].includes(selectedCategory);
  const showPaymentFilter = selectedCategory === 'sales';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Categories List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Report Categories
              </Typography>
              <List>
                {reportCategories.map((category) => (
                  <div key={category.id}>
                    <ListItem button selected={selectedCategory === category.id} onClick={() => setSelectedCategory(category.id)}>
                      <ListItemText primary={category.title} secondary={category.description} />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Report Actions */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {reportCategories.map(
                (category) =>
                  selectedCategory === category.id && (
                    <div key={category.id}>
                      <Typography variant="h5" gutterBottom>
                        {category.title}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {category.description}
                      </Typography>

                      {/* Filters Section */}
                      {(showDateFilter || showPaymentFilter) && (
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {showDateFilter && (
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <Grid item xs={12} sm={6}>
                                <DatePicker
                                  label="Start Date"
                                  value={dateRange.start}
                                  onChange={(newValue: Date | null) => setDateRange({ ...dateRange, start: newValue })}
                                  slotProps={{ textField: { fullWidth: true } }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <DatePicker
                                  label="End Date"
                                  value={dateRange.end}
                                  onChange={(newValue: Date | null) => setDateRange({ ...dateRange, end: newValue })}
                                  slotProps={{ textField: { fullWidth: true } }}
                                />
                              </Grid>
                            </LocalizationProvider>
                          )}

                          {showPaymentFilter && (
                            <Grid item xs={12}>
                              <FormControl fullWidth>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                  value={paymentFilter}
                                  label="Payment Method"
                                  onChange={(e: SelectChangeEvent<string>) =>
                                    setPaymentFilter(e.target.value as 'all' | 'cash' | 'card' | 'upi')
                                  }
                                >
                                  <MenuItem value="all">All Methods</MenuItem>
                                  <MenuItem value="cash">Cash</MenuItem>
                                  <MenuItem value="card">Card</MenuItem>
                                  <MenuItem value="upi">UPI</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          )}
                        </Grid>
                      )}

                      <Stack direction="row" spacing={2}>
                        <Button variant="contained" color="primary" startIcon={<PdfIcon />} onClick={category.pdfHandler}>
                          Export as PDF
                        </Button>
                        <Button variant="contained" color="secondary" startIcon={<ExcelIcon />} onClick={category.excelHandler}>
                          Export as Excel
                        </Button>
                      </Stack>
                    </div>
                  )
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportPage;
