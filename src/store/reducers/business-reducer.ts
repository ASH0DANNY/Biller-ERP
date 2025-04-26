import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { businessDetails } from 'types/business';

interface BusinessState {
    businessDetails: businessDetails;
}

const initialState: BusinessState = {
    businessDetails: {
        businessName: 'N.K.SAREE',
        businessTitle: 'Retail Store',
        businessType: 'Retail',
        businessAddress: 'JUGSALAI, JAMSHEDPUR-831006',
        businessCity: 'Jamshedpur',
        businessState: 'Jharkhand',
        businessPostalCode: 831006,
        businessPhone: [9431111573, 7979976812],
        businessEmail: 'nksaree@gmail.com',
        businessGSTIN: '20AALFN6748B1ZH'
    }
};

const businessSlice = createSlice({
    name: 'business',
    initialState,
    reducers: {
        updateBusinessDetails: (state, action: PayloadAction<Partial<businessDetails>>) => {
            state.businessDetails = {
                ...state.businessDetails,
                ...action.payload
            };
        }
    }
});

export const { updateBusinessDetails } = businessSlice.actions;
export default businessSlice.reducer;