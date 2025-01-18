// routes/api/reservations.ts
import { Handlers } from '$fresh/server.ts';
import { authorize } from '../../library/authorize.ts';
import ReservationModel from '../../models/reservation.ts';

export const handler: Handlers = {
  async POST(req) {
    const newReservation = await req.json();
    console.log('newReservation', newReservation);

    const userId = await authorize(req);
    if (userId) {
      newReservation.user = [userId];
      newReservation.status = 'PENDING';
    }

    const guid = crypto.randomUUID();
    const id = [
      ...newReservation.resource,
      ...newReservation.user,
      guid,
    ];

    if (newReservation.dateEnded) {
      newReservation.dateEnded = newReservation.dateStarted;
    }

    if (newReservation.dateTimeEnded) {
      newReservation.dateTimeEnded = newReservation.dateTimeStarted;
    }

    const response = {
      ...newReservation,
      dateTimeCreated: new Date().toISOString(),
      guid,
      id,
    };

    await ReservationModel.insert(response);
    return new Response(
      JSON.stringify(response),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  },
  async GET(_, ctx) {
    const user = ctx.url.searchParams.get('user');
    const reservations = await ReservationModel.list();
    return new Response(
      JSON.stringify(
        reservations.filter((res) => {
          if (user) {
            return res.user.join(';') === user && res.status === 'APPROVED';
          }
          return res.status === 'APPROVED';
        }),
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  },
};
