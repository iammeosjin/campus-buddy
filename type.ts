export type ID = string[];

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
