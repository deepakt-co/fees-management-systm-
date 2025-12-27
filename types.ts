export interface Payment {
  id: string;
  amount: number;
  date: string; // ISO String
  notes?: string;
}

export enum FeeStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  OVERDUE = 'Overdue'
}

export type FeeFrequency = 'Monthly' | 'Annually' | 'OneTime' | 'Installment';

export interface Student {
  id: string;
  name: string;
  fatherName?: string; // Added field
  photo?: string; // Base64 string
  address: string;
  contactNumber: string;
  course: string; // Added field
  
  // Fee Configuration
  feeFrequency: FeeFrequency; // Added field
  monthlyFee: number; // Represents the amount per cycle (Month/Year/Installment)
  totalInstallments?: number; // Added field for Installment type
  
  enrollmentDate: string; // ISO String
  nextDueDate: string; // ISO String
  payments: Payment[];
}

export interface DashboardStats {
  totalStudents: number;
  totalCollected: number;
  pendingAmount: number;
  overdueCount: number;
}