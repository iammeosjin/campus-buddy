// routes/api/reservations.ts
import { Handlers } from '$fresh/server.ts';
import { ReservationDoc } from '../../type.ts';

// Mock Database (Replace with real database queries)
const reservations: ReservationDoc[] = [
  {
    id: ['1'],
    name: 'Library Room A',
    userName: 'Alice',
    date: '2023-11-10',
    time: '10:00 AM - 11:00 AM',
    resource: {
      id: ['1'],
      name: 'Library Room A',
      capacity: 5,
      location: 'Library',
      status: 'Available',
    },
  },
  {
    id: ['2'],
    name: 'Lab Room B',
    userName: 'Bob',
    date: '2023-11-11',
    time: '2:00 PM - 3:00 PM',
    resource: {
      id: ['2'],
      name: 'Lab Room B',
      capacity: 10,
      location: 'Lab',
      status: 'Available',
    },
  },
];

export const handler: Handlers = {
  GET() {
    return new Response(JSON.stringify(reservations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
  async POST(req) {
    const newReservation = await req.json();
    newReservation.id = reservations.length + 1; // Simple ID increment for demo
    reservations.push(newReservation);
    return new Response(JSON.stringify(newReservation), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },
  // async PUT(req) {
  //   const id = parseInt(req.params.id || '');
  //   const updatedReservation = await req.json();
  //   reservations = reservations.map((
  //     res,
  //   ) => (res.id === id ? { ...res, ...updatedReservation } : res));
  //   return new Response(JSON.stringify({ message: 'Reservation updated' }), {
  //     status: 200,
  //   });
  // },
  // DELETE(req) {
  //   const id = parseInt(req.params.id || '');
  //   reservations = reservations.filter((res) => res.id !== id);
  //   return new Response(JSON.stringify({ message: 'Reservation deleted' }), {
  //     status: 200,
  //   });
  // },
};
