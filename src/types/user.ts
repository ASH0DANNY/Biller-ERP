import { userSelectedCategoryType } from "./product";

export type UserSettings = {
    notifications: boolean;
    emailNotifications: boolean;
};

export type UserType = {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    accessType: 'admin' | 'user';
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
    phoneNumber?: string;
    address?: string;
    profileImage?: string;
    settings: UserSettings;
    categoriesSelected: userSelectedCategoryType[];
};
