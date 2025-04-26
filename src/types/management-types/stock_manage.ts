// Enums for stock management actions
export enum StockActionType {
    ADD = 'add',
    REMOVE = 'remove',
    ADJUST = 'adjust'
}

// Stock transaction history interface
export interface StockTransaction {
    id: string;
    productId: string;
    productName: string;
    productCode: string;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    actionType: StockActionType;
    reason?: string;
    timestamp: string;
    performedBy: string;
}

// Stock alerts interface
export interface StockAlert {
    id: string;
    productId: string;
    productName: string;
    productCode: string;
    currentQuantity: number;
    thresholdQuantity: number;
    status: 'critical' | 'low' | 'normal';
    created: string;
    resolved?: string;
}

// Filter options for stock management
export interface StockFilterOptions {
    category?: string;
    subCategory?: string;
    stockStatus?: 'all' | 'low' | 'out' | 'normal';
    sortBy?: 'name' | 'quantity' | 'recent';
    searchTerm?: string;
}

// Stock management action types for redux
export const FETCH_STOCK_TRANSACTIONS = '@stock/FETCH_TRANSACTIONS';
export const ADD_STOCK_TRANSACTION = '@stock/ADD_TRANSACTION';
export const UPDATE_STOCK_THRESHOLD = '@stock/UPDATE_THRESHOLD';
export const FETCH_STOCK_ALERTS = '@stock/FETCH_ALERTS';
export const RESOLVE_STOCK_ALERT = '@stock/RESOLVE_ALERT';
