export type UserRole = 'admin' | 'agent';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  address?: string;
  aadhar?: string;
  issueDate: string;
  expiryDate: string;
  agentId: string;
  agentName: string;
  status: 'active' | 'expired';
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  logo: string;
  image: string;
  specialists: string[];
  services: string[];
  address: string;
  phone: string;
  discountInfo: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Analytics {
  totalCardsSold: number;
  revenueTotal: number;
  revenueToday: number;
  pendingExpiries: number;
  totalHospitals: number;
  agentPerformance: {
    agentName: string;
    sales: number;
  }[];
}
