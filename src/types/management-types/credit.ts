export interface CreditParty {
  id: string;
  name: string;
  shopName?: string;
  email?: string;
  phone: string;
  address?: string;
  balance: number;
  joinDate: string;
}

export interface Transaction {
  id: string;
  partyId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  date: string;
  description?: string;
  billNumber?: string;
}

export interface CreditFormData {
  name: string;
  shopName?: string;
  email?: string;
  phone: string;
  address?: string;
  initialBalance?: number;
}

export interface TransactionFormData {
  amount: number;
  description?: string;
  billNumber?: string;
}