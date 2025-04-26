import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { Bill } from 'types/bills';

export interface BillState {
    bills: Bill[];
    loading: boolean;
    error: string | null;
}

const initialState: BillState = {
    bills: [],
    loading: false,
    error: null
};

export const createBill = createAsyncThunk('bills/createBill', async (bill: Bill) => {
    const docRef = await addDoc(collection(db, 'bills'), bill);
    return { ...bill, id: docRef.id };
});

export const fetchBills = createAsyncThunk('bills/fetchBills', async () => {
    const q = query(collection(db, 'bills'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as Bill, id: doc.id }));
});

const billsSlice = createSlice({
    name: 'bills',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createBill.pending, (state) => {
                state.loading = true;
            })
            .addCase(createBill.fulfilled, (state, action) => {
                state.bills.unshift(action.payload);
                state.loading = false;
            })
            .addCase(createBill.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create bill';
            })
            .addCase(fetchBills.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBills.fulfilled, (state, action) => {
                state.bills = action.payload;
                state.loading = false;
            })
            .addCase(fetchBills.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch bills';
            });
    }
});

export default billsSlice.reducer;
