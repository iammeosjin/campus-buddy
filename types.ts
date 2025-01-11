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

export enum ResourceStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export type Resource = {
  id: ID;
  name: string;
  capacity: number;
  location: string;
  status: ResourceStatus; // New status field
  remarks?: string; // Optional remarks for "Not Available" status
  creator: ID;
};

export enum OperatorRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export type Operator = {
  id: ID;
  username: string;
  password: string;
  role: OperatorRole;
};

export type Reservation = {
  id: ID;
  resource: ID;
  name: string;
  userName: string;
  date: string;
  time: string;
};
