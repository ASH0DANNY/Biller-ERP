export interface BillItem {
    productCode: string;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface Bill {
    billId: string;
    date: string;
    items: BillItem[];
    subtotal: number;
    tax: number;
    total: number;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'cash' | 'card' | 'upi';
    isReturn?: boolean;
    originalBillId?: string;
}
