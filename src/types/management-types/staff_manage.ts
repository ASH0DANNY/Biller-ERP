// Types for staff management
export enum StaffRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    CASHIER = 'cashier',
    SALESPERSON = 'salesperson',
    INVENTORY = 'inventory',
    OTHER = 'other'
}

export enum StaffStatus {
    ACTIVE = 'active',
    ON_LEAVE = 'on_leave',
    SUSPENDED = 'suspended',
    INACTIVE = 'inactive'
}

export interface StaffMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: StaffRole;
    status: StaffStatus;
    joinDate: string;
    salary: number;
    address?: string;
    emergencyContact?: string;
    profileImage?: string;
    permissions: {
        canManageProducts: boolean;
        canManageStaff: boolean;
        canManageBilling: boolean;
        canViewReports: boolean;
        canManageInventory: boolean;
    };
    workingHours?: {
        sunday: { start: string; end: string; isOff: boolean };
        monday: { start: string; end: string; isOff: boolean };
        tuesday: { start: string; end: string; isOff: boolean };
        wednesday: { start: string; end: string; isOff: boolean };
        thursday: { start: string; end: string; isOff: boolean };
        friday: { start: string; end: string; isOff: boolean };
        saturday: { start: string; end: string; isOff: boolean };
    };
}

export interface StaffAttendance {
    id: string;
    staffId: string;
    date: string;
    checkIn: string;
    checkOut: string;
    totalHours: number;
    status: 'present' | 'absent' | 'late' | 'half-day';
}

export interface StaffFilterOptions {
    role?: StaffRole | 'all';
    status?: StaffStatus | 'all';
    searchTerm?: string;
    sortBy?: 'name' | 'role' | 'joinDate' | 'status';
}