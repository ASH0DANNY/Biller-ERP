import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MaterialTable, { Column } from '@material-table/core';
import {
  Grid,
  useTheme,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Typography,
  Box,
  Alert
} from '@mui/material';

// Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SaveIcon from '@mui/icons-material/Save';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { IconButton, Tooltip } from '@mui/material';

// Types and Redux
import { AppDispatch } from '../../../store/index-store';
import { addCreditParty, addTransaction, fetchCreditParties, fetchPartyTransactions } from '../../../store/reducers/credit-reducer';
import { CreditFormData, TransactionFormData, CreditParty, Transaction } from '../../../types/management-types/credit';
import * as yup from 'yup';
import { useFormik } from 'formik';

interface RootState {
  credit: {
    parties: CreditParty[];
    transactions: Transaction[];
    selectedParty: CreditParty | null;
    loading: boolean;
    error: string | null;
  };
}

const CreditDebitPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { parties, transactions, loading, error } = useSelector((state: RootState) => state.credit);

  // Dialog states
  const [partyDialog, setPartyDialog] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');

  // Forms validation schemas
  const partyValidationSchema = yup.object({
    name: yup.string().required('Name is required'),
    shopName: yup.string(),
    email: yup.string().email('Invalid email format'),
    phone: yup.string().required('Phone number is required'),
    address: yup.string(),
    initialBalance: yup.number().min(0, 'Initial balance must be positive')
  });

  const transactionValidationSchema = yup.object({
    amount: yup.number().required('Amount is required').positive('Amount must be positive'),
    description: yup.string(),
    billNumber: yup.string()
  });

  // Form handlers
  const partyFormik = useFormik<CreditFormData>({
    initialValues: {
      name: '',
      shopName: '',
      email: '',
      phone: '',
      address: '',
      initialBalance: 0
    },
    validationSchema: partyValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      await dispatch(addCreditParty(values));
      resetForm();
      setPartyDialog(false);
    }
  });

  const transactionFormik = useFormik<TransactionFormData>({
    initialValues: {
      amount: 0,
      description: '',
      billNumber: ''
    },
    validationSchema: transactionValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      const selectedParty = parties.find((party) => party.id === selectedPartyId);
      if (selectedParty) {
        await dispatch(
          addTransaction({
            partyId: selectedParty.id,
            data: { ...values, type: transactionType }
          })
        );
        resetForm();
        setTransactionDialog(false);
      }
    }
  });

  // Local state
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCreditParties());
  }, [dispatch]);

  // Fetch transactions when party is selected
  useEffect(() => {
    if (selectedPartyId) {
      dispatch(fetchPartyTransactions(selectedPartyId));
    }
  }, [dispatch, selectedPartyId]);

  // Statistics calculations
  const totalBalance = parties.reduce((sum, party) => sum + party.balance, 0);
  const totalParties = parties.length;
  const positiveBalances = parties.filter((party) => party.balance > 0).length;
  const negativeBalances = parties.filter((party) => party.balance < 0).length;

  const columns: Array<Column<CreditParty>> = [
    {
      title: 'Shop/Party Name',
      field: 'name',
      render: (rowData) => (
        <Box>
          <Typography variant="subtitle1">{rowData.name}</Typography>
          {rowData.shopName && (
            <Typography variant="body2" color="textSecondary">
              {rowData.shopName}
            </Typography>
          )}
        </Box>
      )
    },
    { title: 'Phone', field: 'phone' },
    { title: 'Email', field: 'email' },
    {
      title: 'Balance',
      field: 'balance',
      type: 'currency',
      render: (rowData) => (
        <Typography color={rowData.balance >= 0 ? 'success.main' : 'error.main'} fontWeight="medium">
          ₹{rowData.balance.toLocaleString()}
        </Typography>
      )
    }
  ];

  const transactionColumns: Array<Column<Transaction>> = [
    {
      title: 'Type',
      field: 'type',
      render: (rowData) => (
        <Typography color={rowData.type === 'CREDIT' ? 'success.main' : 'error.main'} fontWeight="medium">
          {rowData.type}
        </Typography>
      )
    },
    {
      title: 'Amount',
      field: 'amount',
      type: 'currency',
      render: (rowData) => (
        <Typography color={rowData.type === 'CREDIT' ? 'success.main' : 'error.main'} fontWeight="medium">
          ₹{rowData.amount.toLocaleString()}
        </Typography>
      )
    },
    {
      title: 'Date',
      field: 'date',
      render: (rowData) =>
        new Date(rowData.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
    },
    { title: 'Description', field: 'description' },
    { title: 'Bill Number', field: 'billNumber' }
  ];

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
                <StorefrontIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Total Parties
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {totalParties}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.success.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Total Balance
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                ₹{totalBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.info.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Credit Accounts
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {positiveBalances}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.warning.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDownIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Debit Accounts
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {negativeBalances}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setPartyDialog(true)}
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            Add New Party
          </Button>
        </Grid>
      </Grid>

      {/* Main Table */}
      <MaterialTable
        title="Credit/Debit Management"
        isLoading={loading}
        columns={columns}
        data={parties}
        actions={[
          {
            icon: () => (
              <Tooltip title="Add Credit">
                <IconButton color="success" size="small">
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            ),
            onClick: (event, rowData) => {
              const party = rowData as CreditParty;
              setSelectedPartyId(party.id);
              setTransactionType('CREDIT');
              setTransactionDialog(true);
            }
          },
          {
            icon: () => (
              <Tooltip title="Add Debit">
                <IconButton color="error" size="small">
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            ),
            onClick: (event, rowData) => {
              const party = rowData as CreditParty;
              setSelectedPartyId(party.id);
              setTransactionType('DEBIT');
              setTransactionDialog(true);
            }
          }
        ]}
        options={{
          actionsColumnIndex: -1,
          headerStyle: {
            backgroundColor: theme.palette.primary.main,
            color: '#fff'
          },
          pageSize: 10,
          pageSizeOptions: [5, 10, 20],
          actionsCellStyle: {
            minWidth: '80px'
          }
        }}
        detailPanel={({ rowData }) => (
          <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Transaction History
            </Typography>
            <MaterialTable
              columns={transactionColumns}
              data={transactions.filter((t) => t.partyId === (rowData as CreditParty).id)}
              options={{
                search: false,
                paging: true,
                pageSize: 5,
                pageSizeOptions: [5, 10],
                toolbar: false
              }}
            />
          </Box>
        )}
      />

      {/* Add Party Dialog */}
      <Dialog open={partyDialog} onClose={() => setPartyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>Add New Party</DialogTitle>
        <form onSubmit={partyFormik.handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Party Name"
                  value={partyFormik.values.name}
                  onChange={partyFormik.handleChange}
                  error={partyFormik.touched.name && Boolean(partyFormik.errors.name)}
                  helperText={partyFormik.touched.name && partyFormik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="shopName"
                  label="Shop Name"
                  value={partyFormik.values.shopName}
                  onChange={partyFormik.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={partyFormik.values.phone}
                  onChange={partyFormik.handleChange}
                  error={partyFormik.touched.phone && Boolean(partyFormik.errors.phone)}
                  helperText={partyFormik.touched.phone && partyFormik.errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={partyFormik.values.email}
                  onChange={partyFormik.handleChange}
                  error={partyFormik.touched.email && Boolean(partyFormik.errors.email)}
                  helperText={partyFormik.touched.email && partyFormik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={partyFormik.values.address}
                  onChange={partyFormik.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="initialBalance"
                  label="Initial Balance"
                  type="number"
                  value={partyFormik.values.initialBalance}
                  onChange={partyFormik.handleChange}
                  error={partyFormik.touched.initialBalance && Boolean(partyFormik.errors.initialBalance)}
                  helperText={partyFormik.touched.initialBalance && partyFormik.errors.initialBalance}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPartyDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={transactionDialog} onClose={() => setTransactionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: transactionType === 'CREDIT' ? 'success.main' : 'error.main', color: 'white' }}>
          Add {transactionType === 'CREDIT' ? 'Credit' : 'Debit'} Transaction
        </DialogTitle>
        <form onSubmit={transactionFormik.handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount"
                  type="number"
                  value={transactionFormik.values.amount}
                  onChange={transactionFormik.handleChange}
                  error={transactionFormik.touched.amount && Boolean(transactionFormik.errors.amount)}
                  helperText={transactionFormik.touched.amount && transactionFormik.errors.amount}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={2}
                  value={transactionFormik.values.description}
                  onChange={transactionFormik.handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="billNumber"
                  label="Bill Number"
                  value={transactionFormik.values.billNumber}
                  onChange={transactionFormik.handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setTransactionDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color={transactionType === 'CREDIT' ? 'success' : 'error'} startIcon={<SaveIcon />}>
              Add {transactionType}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CreditDebitPage;
