import { useState, useEffect } from 'react';
import { Box, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton } from '@mui/material';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MainCard from 'components/MainCard';
import { Add, RefreshCircle } from 'iconsax-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { format, parse, isToday, isSameMonth, subDays } from 'date-fns';
import { Bill } from 'types/bills';
import { fetchproduct } from 'store/reducers/product-reducer';
import { fetchCreditParties } from 'store/reducers/credit-reducer';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store/index-store';

interface DashboardSettings {
  showTodayRevenue: boolean;
  showMonthlyRevenue: boolean;
  showTotalBills: boolean;
  showLowStockCount: boolean;
  showOutOfStockCount: boolean;
  showTotalProducts: boolean;
  showCreditDebitSummary: boolean;
  showTotalParties: boolean;
  showTotalBalance: boolean;
  lowStockThreshold: number;
  recentTransactionsCount: number;
  refreshInterval: number;
  defaultDateRange: string;
  cardsOrder: string[];
}

function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [recentTransactions, setRecentTransactions] = useState<Bill[]>([]);
  const [statistics, setStatistics] = useState({
    todaysRevenue: 0,
    monthlyRevenue: 0,
    totalBills: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<DashboardSettings>({
    showTodayRevenue: true,
    showMonthlyRevenue: true,
    showTotalBills: true,
    showLowStockCount: true,
    showOutOfStockCount: true,
    showTotalProducts: true,
    showCreditDebitSummary: true,
    showTotalParties: true,
    showTotalBalance: true,
    lowStockThreshold: 10,
    recentTransactionsCount: 5,
    refreshInterval: 5,
    defaultDateRange: '7days',
    cardsOrder: ['revenue', 'stock', 'credit']
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Redux selectors with default values
  const { productArray: productData = [], loading: productsLoading = false } = useSelector((state: RootState) => state.products || {});
  const { parties = [], loading: creditLoading = false } = useSelector((state: RootState) => state.credit || {});

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (err) {
        console.error('Error parsing dashboard settings:', err);
      }
    }
  }, []);

  // Stock statistics with null checks
  const stockStats = {
    totalProducts: productData?.length || 0,
    lowStock: productData?.filter((p) => p?.quantity > 0 && p?.quantity <= settings.lowStockThreshold)?.length || 0,
    outOfStock: productData?.filter((p) => p?.quantity <= 0)?.length || 0
  };

  // Credit/Debit statistics with null checks
  const creditStats = {
    totalParties: parties?.length || 0,
    totalBalance: parties?.reduce((sum, party) => sum + (party?.balance || 0), 0) || 0,
    creditAccounts: parties?.filter((party) => (party?.balance || 0) > 0)?.length || 0,
    debitAccounts: parties?.filter((party) => (party?.balance || 0) < 0)?.length || 0
  };

  // Auto-refresh setup
  useEffect(() => {
    if (settings.refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, settings.refreshInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.refreshInterval]);

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchproduct());
    dispatch(fetchCreditParties());
  }, [dispatch]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const billsCollection = collection(db, 'bills');

      // Calculate date range based on settings
      const startDate = (() => {
        switch (settings.defaultDateRange) {
          case '7days':
            return subDays(new Date(), 7);
          case '30days':
            return subDays(new Date(), 30);
          case '90days':
            return subDays(new Date(), 90);
          default:
            return subDays(new Date(), 7);
        }
      })();

      // Query with date filter
      const billsQuery = query(billsCollection, where('date', '>=', format(startDate, 'yyyy-MM-dd')), orderBy('date', 'desc'));

      const billsSnapshot = await getDocs(billsQuery);
      const allBills: Bill[] = [];

      billsSnapshot.forEach((doc) => {
        const billData = doc.data() as Omit<Bill, 'billId'>;
        const bill: Bill = {
          ...billData,
          billId: doc.id,
          items: billData.items || [],
          total: typeof billData.total === 'number' ? billData.total : 0,
          subtotal: typeof billData.subtotal === 'number' ? billData.subtotal : 0,
          tax: typeof billData.tax === 'number' ? billData.tax : 0,
          paymentMethod: billData.paymentMethod || 'cash',
          date: billData.date || format(new Date(), 'yyyy-MM-dd')
        };
        allBills.push(bill);
      });

      // Set recent transactions based on settings
      setRecentTransactions(allBills.slice(0, settings.recentTransactionsCount));

      // Calculate revenue statistics
      const today = new Date();

      let todaysRevenue = 0;
      let monthlyRevenue = 0;

      allBills.forEach((bill) => {
        try {
          const billDate = parse(bill.date, 'yyyy-MM-dd', new Date());

          if (isToday(billDate)) {
            todaysRevenue += bill.total;
          }

          if (isSameMonth(billDate, today)) {
            monthlyRevenue += bill.total;
          }
        } catch (err) {
          console.error(`Error parsing date for bill ${bill.billId}: ${bill.date}`);
        }
      });

      setStatistics({
        todaysRevenue,
        monthlyRevenue,
        totalBills: allBills.length
      });

      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBill = () => {
    navigate('/billing');
  };

  const handleRefresh = () => {
    fetchData();
  };

  const formatCurrency = (value: number): string => {
    return `₹${value.toLocaleString()}`;
  };

  // Render sections based on order
  const renderSection = (section: string) => {
    switch (section) {
      case 'revenue':
        return (
          <>
            {settings.showTodayRevenue && (
              <Grid item xs={12} sm={6} md={4}>
                <AnalyticEcommerce
                  title="Today's Revenue"
                  count={loading ? '₹...' : formatCurrency(statistics.todaysRevenue)}
                  percentage={27.4}
                  extra={`${formatCurrency(statistics.todaysRevenue)} today`}
                  color="success"
                />
              </Grid>
            )}

            {settings.showMonthlyRevenue && (
              <Grid item xs={12} sm={6} md={4}>
                <AnalyticEcommerce
                  title="Monthly Revenue"
                  count={loading ? '₹...' : formatCurrency(statistics.monthlyRevenue)}
                  percentage={12.5}
                  extra={`${formatCurrency(statistics.monthlyRevenue)} this month`}
                  color="primary"
                />
              </Grid>
            )}

            {settings.showTotalBills && (
              <Grid item xs={12} sm={6} md={4}>
                <AnalyticEcommerce
                  title="Total Bills"
                  count={loading ? '...' : statistics.totalBills.toString()}
                  percentage={8.5}
                  extra={`${statistics.totalBills.toString()} bills`}
                  color="warning"
                />
              </Grid>
            )}
          </>
        );

      case 'stock':
        return (
          <>
            {settings.showTotalProducts && (
              <Grid item xs={12} sm={6} md={4}>
                <AnalyticEcommerce
                  title="Total Products"
                  count={stockStats.totalProducts.toString()}
                  color="primary"
                  extra={`${stockStats.totalProducts} items in inventory`}
                />
              </Grid>
            )}

            {settings.showLowStockCount && (
              <Grid item xs={12} sm={6} md={4}>
                <AnalyticEcommerce
                  title="Low Stock Items"
                  count={stockStats.lowStock.toString()}
                  color="warning"
                  extra={`Below threshold: ${settings.lowStockThreshold} units`}
                />
              </Grid>
            )}

            {settings.showOutOfStockCount && (
              <Grid item xs={12} sm={6} md={4}>
                <AnalyticEcommerce
                  title="Out of Stock"
                  count={stockStats.outOfStock.toString()}
                  color="error"
                  extra="Products needing restock"
                />
              </Grid>
            )}
          </>
        );

      case 'credit':
        return (
          <>
            {settings.showTotalParties && (
              <Grid item xs={12} sm={6} md={3}>
                <AnalyticEcommerce
                  title="Total Parties"
                  count={creditStats.totalParties.toString()}
                  color="primary"
                  extra="Active credit accounts"
                />
              </Grid>
            )}

            {settings.showTotalBalance && (
              <Grid item xs={12} sm={6} md={3}>
                <AnalyticEcommerce
                  title="Net Balance"
                  count={formatCurrency(creditStats.totalBalance)}
                  color={creditStats.totalBalance >= 0 ? 'success' : 'error'}
                  extra={`${creditStats.creditAccounts} Credit / ${creditStats.debitAccounts} Debit`}
                />
              </Grid>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {productsLoading || creditLoading ? (
          <Grid item xs={12}>
            <Typography>Loading dashboard data...</Typography>
          </Grid>
        ) : (
          settings.cardsOrder?.map((section) => renderSection(section))
        )}

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <MainCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h3">Recent Transactions</Typography>
                <IconButton onClick={handleRefresh} size="small">
                  <RefreshCircle />
                </IconButton>
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Last updated: {format(lastRefresh, 'HH:mm:ss')}
                </Typography>
                <Button color="primary" startIcon={<Add />} onClick={handleCreateBill}>
                  Create New Bill
                </Button>
              </Box>
            }
          >
            {loading ? (
              <Typography>Loading transactions...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Items</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <TableRow key={transaction.billId}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.customerName || 'Anonymous'}</TableCell>
                          <TableCell align="right">{transaction.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                          <TableCell align="right">{formatCurrency(transaction.total)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
