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

export enum ResourceType {
  STUDY_ROOM = 'STUDY_ROOM',
  LABORATORY = 'LABORATORY',
  SPORT_FACULTY = 'SPORT_FACULTY',
  SPORT_EQUIPMENT = 'SPORT_EQUIPMENT',
}

export type Resource = {
  id: ID;
  name: string;
  capacity: number;
  location: string;
  type: ResourceType;
  status: ResourceStatus; // New status field
  remarks?: string; // Optional remarks for "Not Available" status
  creator: ID;
  image: string;
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
  user: ID;
  creator?: ID;
  guid: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  dateStarted: string;
  dateEnded: string;
  dateTimeStarted: string;
  dateTimeEnded: string;
  remarks?: string;
  dateTimeCreated: string;
};
