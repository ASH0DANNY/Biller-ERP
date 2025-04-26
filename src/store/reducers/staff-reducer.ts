import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { StaffMember } from 'types/management-types/staff_manage';

interface StaffState {
    staffMembers: StaffMember[];
    selectedStaff: StaffMember | null;
    loading: boolean;
    error: string | null;
}

const initialState: StaffState = {
    staffMembers: [],
    selectedStaff: null,
    loading: false,
    error: null
};

const generateStaffId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'STAFF-';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

// Add new staff member
export const addStaffMember = createAsyncThunk<StaffMember, Omit<StaffMember, 'id'>>(
    'staff/addStaffMember',
    async (staffData) => {
        try {
            const staffId = generateStaffId();
            const newStaff = {
                ...staffData,
                id: staffId,
                joinDate: staffData.joinDate || new Date().toISOString()
            };

            await setDoc(doc(db, 'staff', staffId), newStaff);
            return newStaff as StaffMember;
        } catch (error) {
            console.error('Error adding staff member: ', error);
            throw error;
        }
    }
);

// Fetch all staff members
export const fetchStaffMembers = createAsyncThunk<StaffMember[], void>(
    'staff/fetchStaffMembers',
    async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'staff'));
            const staffList: StaffMember[] = [];

            querySnapshot.forEach((doc) => {
                staffList.push(doc.data() as StaffMember);
            });

            return staffList;
        } catch (error) {
            console.error('Error fetching staff members: ', error);
            throw error;
        }
    }
);

// Update staff member
export const updateStaffMember = createAsyncThunk<StaffMember, StaffMember>(
    'staff/updateStaffMember',
    async (staffData) => {
        try {
            const staffRef = doc(db, 'staff', staffData.id);
            await updateDoc(staffRef, { ...staffData });
            return staffData;
        } catch (error) {
            console.error('Error updating staff member: ', error);
            throw error;
        }
    }
);

// Delete staff member
export const deleteStaffMember = createAsyncThunk<string, string>(
    'staff/deleteStaffMember',
    async (staffId) => {
        try {
            console.log('Attempting to delete staff member with ID:', staffId);
            const staffRef = doc(db, 'staff', staffId);
            await deleteDoc(staffRef);
            console.log('Successfully deleted staff member from Firebase');
            return staffId;
        } catch (error) {
            console.error('Error deleting staff member:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to delete staff member: ${error.message}`);
            } else {
                throw new Error('Failed to delete staff member: Unknown error');
            }
        }
    }
);

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        setSelectedStaff: (state, action: PayloadAction<StaffMember | null>) => {
            state.selectedStaff = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Add staff member cases
            .addCase(addStaffMember.pending, (state) => {
                state.loading = true;
            })
            .addCase(addStaffMember.fulfilled, (state, action) => {
                state.loading = false;
                state.staffMembers.push(action.payload);
            })
            .addCase(addStaffMember.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to add staff member';
            })

            // Fetch staff members cases
            .addCase(fetchStaffMembers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStaffMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.staffMembers = action.payload;
            })
            .addCase(fetchStaffMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch staff members';
            })

            // Update staff member cases
            .addCase(updateStaffMember.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateStaffMember.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.staffMembers.findIndex(staff => staff.id === action.payload.id);
                if (index !== -1) {
                    state.staffMembers[index] = action.payload;
                }
            })
            .addCase(updateStaffMember.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update staff member';
            })

            // Delete staff member cases
            .addCase(deleteStaffMember.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteStaffMember.fulfilled, (state, action) => {
                state.loading = false;
                state.staffMembers = state.staffMembers.filter(staff => staff.id !== action.payload);
            })
            .addCase(deleteStaffMember.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete staff member';
            });
    }
});

export const { setSelectedStaff } = staffSlice.actions;
export default staffSlice.reducer;