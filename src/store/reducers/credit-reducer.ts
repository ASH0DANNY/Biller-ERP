import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { CreditParty, Transaction, CreditFormData, TransactionFormData } from 'types/management-types/credit';

interface CreditState {
    parties: CreditParty[];
    transactions: Transaction[];
    selectedParty: CreditParty | null;
    loading: boolean;
    error: string | null;
}

const initialState: CreditState = {
    parties: [],
    transactions: [],
    selectedParty: null,
    loading: false,
    error: null
};

// Add new credit party
export const addCreditParty = createAsyncThunk<CreditParty, CreditFormData>(
    'credit/addCreditParty',
    async (partyData) => {
        try {
            const newParty = {
                ...partyData,
                id: doc(collection(db, 'credit-parties')).id,
                balance: partyData.initialBalance || 0,
                joinDate: new Date().toISOString()
            };

            await setDoc(doc(db, 'credit-parties', newParty.id), newParty);
            return newParty as CreditParty;
        } catch (error) {
            console.error('Error adding credit party: ', error);
            throw error;
        }
    }
);

// Fetch all credit parties
export const fetchCreditParties = createAsyncThunk<CreditParty[]>(
    'credit/fetchCreditParties',
    async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'credit-parties'));
            return querySnapshot.docs.map(doc => doc.data() as CreditParty);
        } catch (error) {
            console.error('Error fetching credit parties: ', error);
            throw error;
        }
    }
);

// Add transaction
export const addTransaction = createAsyncThunk<Transaction, { partyId: string, data: TransactionFormData & { type: 'CREDIT' | 'DEBIT' } }>(
    'credit/addTransaction',
    async ({ partyId, data }) => {
        try {
            const transactionData = {
                ...data,
                id: doc(collection(db, 'credit-transactions')).id,
                partyId,
                date: new Date().toISOString()
            };

            // Add transaction
            await setDoc(doc(db, 'credit-transactions', transactionData.id), transactionData);

            // Get current party data and update balance
            const partyRef = doc(db, 'credit-parties', partyId);
            const partySnapshot = await getDocs(collection(db, 'credit-parties'));
            const party = partySnapshot.docs.find(doc => doc.id === partyId)?.data() as CreditParty;
            const balanceChange = data.type === 'CREDIT' ? data.amount : -data.amount;
            await updateDoc(partyRef, {
                balance: (party?.balance || 0) + balanceChange
            });

            return transactionData;
        } catch (error) {
            console.error('Error adding transaction: ', error);
            throw error;
        }
    }
);

// Fetch transactions for a party
export const fetchPartyTransactions = createAsyncThunk<Transaction[], string>(
    'credit/fetchPartyTransactions',
    async (partyId) => {
        try {
            const querySnapshot = await getDocs(collection(db, 'credit-transactions'));
            return querySnapshot.docs
                .map(doc => doc.data() as Transaction)
                .filter(transaction => transaction.partyId === partyId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (error) {
            console.error('Error fetching transactions: ', error);
            throw error;
        }
    }
);

const creditSlice = createSlice({
    name: 'credit',
    initialState,
    reducers: {
        setSelectedParty: (state, action: PayloadAction<CreditParty | null>) => {
            state.selectedParty = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Add credit party cases
            .addCase(addCreditParty.pending, (state) => {
                state.loading = true;
            })
            .addCase(addCreditParty.fulfilled, (state, action) => {
                state.loading = false;
                state.parties.push(action.payload);
            })
            .addCase(addCreditParty.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to add credit party';
            })

            // Fetch credit parties cases
            .addCase(fetchCreditParties.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCreditParties.fulfilled, (state, action) => {
                state.loading = false;
                state.parties = action.payload;
            })
            .addCase(fetchCreditParties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch credit parties';
            })

            // Add transaction cases
            .addCase(addTransaction.pending, (state) => {
                state.loading = true;
            })
            .addCase(addTransaction.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions.unshift(action.payload);
                // Update party balance
                const party = state.parties.find(p => p.id === action.payload.partyId);
                if (party) {
                    party.balance += action.payload.type === 'CREDIT' ? action.payload.amount : -action.payload.amount;
                }
            })
            .addCase(addTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to add transaction';
            })

            // Fetch transactions cases
            .addCase(fetchPartyTransactions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPartyTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(fetchPartyTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch transactions';
            });
    }
});

export const { setSelectedParty } = creditSlice.actions;
export default creditSlice.reducer;