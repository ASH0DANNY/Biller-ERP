import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/index-store';
import {
  fetchStaffMembers,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
  setSelectedStaff
} from '../../store/reducers/staff-reducer';
import { StaffMember, StaffRole, StaffStatus, StaffFilterOptions } from '../../types/management-types/staff_manage';

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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
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
  Avatar,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SellIcon from '@mui/icons-material/Sell';
import InventoryIcon from '@mui/icons-material/Inventory';
import WorkIcon from '@mui/icons-material/Work';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface RootState {
  staff: {
    staffMembers: StaffMember[];
    selectedStaff: StaffMember | null;
    loading: boolean;
    error: string | null;
  };
}

const StaffManagementPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  // const { staffMembers, loading, error } = useSelector((state: RootState) => state.staff);
  const staffState = useSelector((state: RootState) => state.staff);
  console.log('Redux state:', staffState);

  // Then destructure if it exists
  const { staffMembers = [], loading = false, error = null } = staffState || {};

  // Local state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [openStaffDialog, setOpenStaffDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [staffFormData, setStaffFormData] = useState<Partial<StaffMember>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: StaffRole.SALESPERSON,
    status: StaffStatus.ACTIVE,
    joinDate: new Date().toISOString().split('T')[0],
    salary: 0,
    permissions: {
      canManageProducts: false,
      canManageStaff: false,
      canManageBilling: true,
      canViewReports: false,
      canManageInventory: false
    }
  });
  const [filters, setFilters] = useState<StaffFilterOptions>({
    role: 'all',
    status: 'all',
    searchTerm: '',
    sortBy: 'name'
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [viewStaffOpen, setViewStaffOpen] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

  // Fetch staff on component mount
  useEffect(() => {
    dispatch(fetchStaffMembers());
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

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentValue = staffFormData[parent as keyof typeof staffFormData];

      if (typeof parentValue === 'object' && parentValue !== null) {
        setStaffFormData({
          ...staffFormData,
          [parent]: {
            ...parentValue,
            [child]: value
          }
        });
      }
    } else {
      setStaffFormData({
        ...staffFormData,
        [field]: value
      });
    }

    // Clear specific field error when user edits that field
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: ''
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Required fields
    if (!staffFormData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!staffFormData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!staffFormData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(staffFormData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!staffFormData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (staffFormData.salary === undefined || staffFormData.salary < 0) {
      errors.salary = 'Valid salary is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open add staff dialog
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setStaffFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: StaffRole.SALESPERSON,
      status: StaffStatus.ACTIVE,
      joinDate: new Date().toISOString().split('T')[0],
      salary: 0,
      permissions: {
        canManageProducts: false,
        canManageStaff: false,
        canManageBilling: true,
        canViewReports: false,
        canManageInventory: false
      }
    });
    setFormErrors({});
    setSubmitAttempted(false);
    setOpenStaffDialog(true);
  };

  // Open edit staff dialog
  const handleOpenEditDialog = (staff: StaffMember) => {
    setDialogMode('edit');
    setStaffFormData(staff);
    setFormErrors({});
    setSubmitAttempted(false);
    setOpenStaffDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenStaffDialog(false);
  };

  // Open view staff dialog
  const handleViewStaff = (staff: StaffMember) => {
    dispatch(setSelectedStaff(staff));
    setViewStaffOpen(true);
  };

  // Close view staff dialog
  const handleCloseViewStaff = () => {
    setViewStaffOpen(false);
    dispatch(setSelectedStaff(null));
  };

  // Save staff data (add or edit)
  const handleSaveStaff = () => {
    setSubmitAttempted(true);
    if (validateForm()) {
      if (dialogMode === 'add') {
        dispatch(addStaffMember(staffFormData as Omit<StaffMember, 'id'>));
      } else {
        dispatch(updateStaffMember(staffFormData as StaffMember));
      }
      handleCloseDialog();
    }
  };

  // Open delete confirmation
  const handleOpenDeleteConfirm = (staffId: string) => {
    console.log('Opening delete confirmation for staff ID:', staffId);
    setStaffToDelete(staffId);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    console.log('Confirming delete for staff ID:', staffToDelete);
    if (staffToDelete) {
      dispatch(deleteStaffMember(staffToDelete));
      console.log('Dispatched delete action');
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    console.log('Cancelling delete');
    setDeleteConfirmOpen(false);
    setStaffToDelete(null);
  };

  // Handle role filter change
  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setFilters({ ...filters, role: event.target.value as StaffRole | 'all' });
  };

  // Handle status filter change
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setFilters({ ...filters, status: event.target.value as StaffStatus | 'all' });
  };

  // Handle sort by change
  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    setFilters({ ...filters, sortBy: event.target.value as 'name' | 'role' | 'joinDate' | 'status' });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      role: 'all',
      status: 'all',
      searchTerm: '',
      sortBy: 'name'
    });
    setShowFilters(false);
  };

  // Get role icon
  const getRoleIcon = (role: StaffRole) => {
    switch (role) {
      case StaffRole.ADMIN:
        return <AdminPanelSettingsIcon fontSize="small" />;
      case StaffRole.MANAGER:
        return <ManageAccountsIcon fontSize="small" />;
      case StaffRole.CASHIER:
        return <SellIcon fontSize="small" />;
      case StaffRole.INVENTORY:
        return <InventoryIcon fontSize="small" />;
      default:
        return <WorkIcon fontSize="small" />;
    }
  };

  // Get status color
  const getStatusColor = (status: StaffStatus) => {
    switch (status) {
      case StaffStatus.ACTIVE:
        return theme.palette.success.main;
      case StaffStatus.ON_LEAVE:
        return theme.palette.info.main;
      case StaffStatus.SUSPENDED:
        return theme.palette.warning.main;
      case StaffStatus.INACTIVE:
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Filter and sort staff members
  const filteredStaff = staffMembers
    .filter((staff) => {
      // Apply role filter
      if (filters.role && filters.role !== 'all' && staff.role !== filters.role) {
        return false;
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all' && staff.status !== filters.status) {
        return false;
      }

      // Apply search
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          staff.firstName.toLowerCase().includes(searchLower) ||
          staff.lastName.toLowerCase().includes(searchLower) ||
          staff.email.toLowerCase().includes(searchLower) ||
          (typeof staff.phone === 'string' && staff.phone.includes(searchLower))
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (filters.sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'joinDate':
          return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Statistics
  const totalStaff = staffMembers.length;
  const activeStaff = staffMembers.filter((staff) => staff.status === StaffStatus.ACTIVE).length;
  const onLeaveStaff = staffMembers.filter((staff) => staff.status === StaffStatus.ON_LEAVE).length;
  const inactiveStaff = staffMembers.filter(
    (staff) => staff.status === StaffStatus.INACTIVE || staff.status === StaffStatus.SUSPENDED
  ).length;

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get avatar color based on role
  const getAvatarColor = (role: StaffRole) => {
    switch (role) {
      case StaffRole.ADMIN:
        return theme.palette.error.main;
      case StaffRole.MANAGER:
        return theme.palette.warning.main;
      case StaffRole.CASHIER:
        return theme.palette.success.main;
      case StaffRole.SALESPERSON:
        return theme.palette.primary.main;
      case StaffRole.INVENTORY:
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

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
                <PersonAddIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Total Staff
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {totalStaff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.success.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AdminPanelSettingsIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Active
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {activeStaff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.info.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  On Leave
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {onLeaveStaff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: theme.palette.warning.light }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ErrorOutlineIcon sx={{ color: 'white', mr: 1 }} />
                <Typography variant="h6" color="white">
                  Inactive/Suspended
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {inactiveStaff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Add Button */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search staff by name, email or phone"
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
          <Grid item xs={6} md={2}>
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setShowFilters(!showFilters)} fullWidth>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddDialog}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Add Staff
            </Button>
          </Grid>
          <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Refresh Staff List">
              <IconButton onClick={() => dispatch(fetchStaffMembers())} color="primary">
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
                  <InputLabel>Role</InputLabel>
                  <Select value={filters.role || 'all'} onChange={handleRoleChange} label="Role">
                    <MenuItem value="all">All Roles</MenuItem>
                    {Object.values(StaffRole).map((role) => (
                      <MenuItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={filters.status || 'all'} onChange={handleStatusChange} label="Status">
                    <MenuItem value="all">All Status</MenuItem>
                    {Object.values(StaffStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status
                          .replace('_', ' ')
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select value={filters.sortBy || 'name'} onChange={handleSortByChange} label="Sort By">
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="role">Role</MenuItem>
                    <MenuItem value="joinDate">Join Date</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
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

      {/* Staff Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Join Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading staff members...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <ErrorOutlineIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                    <Typography>No staff members found</Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpenAddDialog} startIcon={<PersonAddIcon />}>
                      Add Staff Member
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((staff) => (
                  <TableRow
                    key={staff.id}
                    sx={{
                      '&:hover': { bgcolor: theme.palette.action.hover },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: getAvatarColor(staff.role),
                            mr: 2,
                            width: 36,
                            height: 36
                          }}
                        >
                          {getInitials(staff.firstName, staff.lastName)}
                        </Avatar>
                        <Typography variant="body1" fontWeight="medium">
                          {staff.firstName} {staff.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(staff.role)}
                        label={staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.phone}</TableCell>
                    <TableCell>
                      {new Date(staff.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={staff.status
                          .replace('_', ' ')
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                        sx={{
                          backgroundColor: `${getStatusColor(staff.status)}20`,
                          color: getStatusColor(staff.status),
                          borderColor: getStatusColor(staff.status),
                          borderRadius: 1
                        }}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="View Details">
                          <IconButton color="info" onClick={() => handleViewStaff(staff)} size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Staff">
                          <IconButton color="primary" onClick={() => handleOpenEditDialog(staff)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Staff">
                          <IconButton color="error" onClick={() => handleOpenDeleteConfirm(staff.id)} size="small">
                            <DeleteIcon />
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
          count={filteredStaff.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle sx={{ color: 'error.main' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this staff member? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit" startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Staff Details Dialog */}
      <Dialog open={viewStaffOpen} onClose={handleCloseViewStaff} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>Staff Details</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {staffState.selectedStaff && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: getAvatarColor(staffState.selectedStaff.role), width: 64, height: 64, mr: 2 }}>
                    {getInitials(staffState.selectedStaff.firstName, staffState.selectedStaff.lastName)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {staffState.selectedStaff.firstName} {staffState.selectedStaff.lastName}
                    </Typography>
                    <Chip
                      icon={getRoleIcon(staffState.selectedStaff.role)}
                      label={staffState.selectedStaff.role.charAt(0).toUpperCase() + staffState.selectedStaff.role.slice(1)}
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">{staffState.selectedStaff.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Phone
                </Typography>
                <Typography variant="body1">{staffState.selectedStaff.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Join Date
                </Typography>
                <Typography variant="body1">
                  {new Date(staffState.selectedStaff.joinDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={staffState.selectedStaff.status
                    .replace('_', ' ')
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                  sx={{
                    backgroundColor: `${getStatusColor(staffState.selectedStaff.status)}20`,
                    color: getStatusColor(staffState.selectedStaff.status),
                    borderColor: getStatusColor(staffState.selectedStaff.status),
                    borderRadius: 1,
                    mt: 1
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Salary
                </Typography>
                <Typography variant="body1">${staffState.selectedStaff.salary.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Permissions
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(staffState.selectedStaff.permissions).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Chip
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        color={value ? 'success' : 'default'}
                        variant={value ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseViewStaff} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={openStaffDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          {dialogMode === 'add' ? 'Add New Staff Member' : 'Edit Staff Member'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {submitAttempted && Object.keys(formErrors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Please fix the errors before submitting the form.
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                value={staffFormData.firstName || ''}
                onChange={(e) => handleFormChange('firstName', e.target.value)}
                fullWidth
                required
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                value={staffFormData.lastName || ''}
                onChange={(e) => handleFormChange('lastName', e.target.value)}
                fullWidth
                required
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={staffFormData.email || ''}
                onChange={(e) => handleFormChange('email', e.target.value)}
                fullWidth
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                value={staffFormData.phone || ''}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                fullWidth
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={staffFormData.role || StaffRole.SALESPERSON}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  label="Role"
                >
                  {Object.values(StaffRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getRoleIcon(role)}
                        <Typography sx={{ ml: 1 }}>{role.charAt(0).toUpperCase() + role.slice(1)}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={staffFormData.status || StaffStatus.ACTIVE}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  label="Status"
                >
                  {Object.values(StaffStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      <Chip
                        label={status
                          .replace('_', ' ')
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(status)}20`,
                          color: getStatusColor(status),
                          borderColor: getStatusColor(status),
                          borderRadius: 1
                        }}
                        variant="outlined"
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Join Date"
                type="date"
                value={staffFormData.joinDate || ''}
                onChange={(e) => handleFormChange('joinDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Salary"
                type="number"
                value={staffFormData.salary || 0}
                onChange={(e) => handleFormChange('salary', parseFloat(e.target.value))}
                fullWidth
                required
                error={!!formErrors.salary}
                helperText={formErrors.salary}
              />
            </Grid>

            {/* Permissions */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Permissions
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(staffFormData.permissions || {}).map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!value}
                          onChange={(e) => handleFormChange(`permissions.${key}`, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit" startIcon={<CancelIcon />} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveStaff} color="primary" startIcon={<SaveIcon />} variant="contained">
            {dialogMode === 'add' ? 'Add Staff' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagementPage;
