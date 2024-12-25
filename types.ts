export type ID = (string | number)[];
export type KVEntry = {
  id: ID;
};

export enum UserRole {
  STUDENT = 'STUDENT',
  STAFF = 'STAFF',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export type User = {
  id: ID;
  sid: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export enum ROUTE {
  HOME = '/',
  DASHBOARD = '/dashboard',
  USERS = '/users',
}

export type Resource = {
  id: ID;
  name: string;
  capacity: number;
  location: string;
  status: 'Available' | 'Not Available'; // New status field
  remarks?: string; // Optional remarks for "Not Available" status
};

export type Reservation = {
  id: ID;
  resource: ID;
  name: string;
  userName: string;
  date: string;
  time: string;
};

export type ReservationDoc = Omit<Reservation, 'resource'> & {
  resource: Resource;
};
