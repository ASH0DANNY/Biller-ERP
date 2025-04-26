import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBills, createBill } from 'store/reducers/bills-reducer';
import { RootState, AppDispatch } from 'store/index-store';
import MaterialTable, { Column, Action } from '@material-table/core';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import UndoIcon from '@mui/icons-material/Undo';
import { PrintBillInvoice } from '../../utils/pdf-excel/GenerateBillInvoice';
import { Bill } from 'types/bills';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';

const MyBillsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bills, loading } = useSelector((state: RootState) => state.bills);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [returnItems, setReturnItems] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  const handlePrintInvoice = (bill: Bill) => {
    PrintBillInvoice(bill);
  };

  const handleReturnClick = (bill: Bill) => {
    if (bill.isReturn) {
      setError('Cannot return a return bill');
      return;
    }
    setSelectedBill(bill);
    const initialReturnItems = bill.items.reduce((acc, item) => {
      acc[item.productCode] = 0;
      return acc;
    }, {} as { [key: string]: number });
    setReturnItems(initialReturnItems);
    setReturnDialogOpen(true);
  };

  const handleQuantityChange = (productCode: string, value: number, maxQuantity: number) => {
    if (value >= 0 && value <= maxQuantity) {
      setReturnItems((prev) => ({
        ...prev,
        [productCode]: value
      }));
    }
  };

  const updateProductStock = async (productCode: string, quantityToAdd: number) => {
    try {
      const productRef = doc(db, 'products', productCode);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const currentQuantity = productSnap.data().quantity || 0;
        await updateDoc(productRef, {
          quantity: currentQuantity + quantityToAdd
        });
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  const handleReturnSubmit = async () => {
    if (!selectedBill) return;

    try {
      // Filter out items with 0 return quantity
      const itemsToReturn = selectedBill.items
        .filter((item) => returnItems[item.productCode] > 0)
        .map((item) => ({
          ...item,
          quantity: returnItems[item.productCode],
          totalPrice: -(item.price * returnItems[item.productCode])
        }));

      if (itemsToReturn.length === 0) {
        setError('Please select items to return');
        return;
      }

      // Calculate totals for return bill
      const returnSubtotal = itemsToReturn.reduce((sum, item) => sum + item.totalPrice, 0);
      const returnTax = returnSubtotal * 0.18;
      const returnTotal = returnSubtotal + returnTax;

      const returnBill: Bill = {
        billId: `R-${selectedBill.billId}`,
        date: new Date().toISOString(),
        items: itemsToReturn,
        subtotal: -Math.abs(returnSubtotal),
        tax: -Math.abs(returnTax),
        total: -Math.abs(returnTotal),
        customerName: selectedBill.customerName,
        customerPhone: selectedBill.customerPhone,
        paymentMethod: selectedBill.paymentMethod,
        isReturn: true,
        originalBillId: selectedBill.billId
      };

      // Update product stock
      for (const item of itemsToReturn) {
        await updateProductStock(item.productCode, item.quantity);
      }

      // Create return bill
      await dispatch(createBill(returnBill)).unwrap();

      setReturnDialogOpen(false);
      setSelectedBill(null);
      setReturnItems({});
      setError('');
    } catch (error) {
      console.error('Error processing return:', error);
      setError('Failed to process return');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const columns: Array<Column<Bill>> = [
    {
      title: 'Bill ID',
      field: 'billId',
      cellStyle: { textAlign: 'center' },
      headerStyle: { textAlign: 'center' }
    },
    {
      title: 'Date',
      field: 'date',
      render: (rowData) => new Date(rowData.date).toLocaleDateString(),
      cellStyle: { textAlign: 'center' },
      headerStyle: { textAlign: 'center' }
    },
    {
      title: 'Customer',
      field: 'customerName',
      render: (rowData) => rowData.customerName || 'N/A',
      cellStyle: { textAlign: 'center' },
      headerStyle: { textAlign: 'center' }
    },
    {
      title: 'Items',
      field: 'items',
      render: (rowData) => rowData.items.length,
      cellStyle: { textAlign: 'center' },
      headerStyle: { textAlign: 'center' }
    },
    {
      title: 'Total Amount',
      field: 'total',
      render: (rowData) => `₹${Math.abs(rowData.total).toFixed(2)}`,
      cellStyle: { textAlign: 'center' },
      headerStyle: { textAlign: 'center' }
    },
    {
      title: 'Payment Method',
      field: 'paymentMethod',
      render: (rowData) => rowData.paymentMethod.toUpperCase(),
      cellStyle: { textAlign: 'center' },
      headerStyle: { textAlign: 'center' }
    }
  ];

  const tableActions: Array<Action<Bill>> = [
    {
      icon: () => <PrintIcon sx={{ color: 'var(--bs-primary)' }} />,
      tooltip: 'Print Invoice',
      onClick: (event, rowData) => {
        if (rowData && !Array.isArray(rowData)) {
          handlePrintInvoice(rowData);
        }
      }
    },
    {
      icon: () => <UndoIcon sx={{ color: 'var(--bs-secondary)' }} />,
      tooltip: 'Return Items',
      onClick: (event, rowData) => {
        if (rowData && !Array.isArray(rowData)) {
          handleReturnClick(rowData);
        }
      }
    }
  ];

  return (
    <div>
      <MaterialTable
        title=""
        columns={columns}
        data={bills}
        actions={tableActions}
        options={{
          grouping: true,
          headerStyle: {
            backgroundColor: '#5d87ff',
            color: '#FFF'
          },
          rowStyle: (rowData) => ({
            backgroundColor: rowData.isReturn ? '#fff3f3' : 'inherit'
          }),
          actionsColumnIndex: -1,
          actionsCellStyle: { textAlign: 'center' }
        }}
      />

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Return Items from Bill {selectedBill?.billId}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Original Qty</TableCell>
                  <TableCell align="center">Return Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedBill?.items.map((item) => (
                  <TableRow key={item.productCode}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">₹{item.price}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={returnItems[item.productCode] || 0}
                        onChange={(e) => handleQuantityChange(item.productCode, parseInt(e.target.value) || 0, item.quantity)}
                        inputProps={{
                          min: 0,
                          max: item.quantity,
                          style: { textAlign: 'center' }
                        }}
                        size="small"
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReturnSubmit} variant="contained" color="primary">
            Process Return
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MyBillsPage;
