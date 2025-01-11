// routes/api/reservations.ts
import { Handlers } from '$fresh/server.ts';
import ResourceModel from '../../models/resource.ts';

export const handler: Handlers = {
  async POST(req) {
    const body = await req.json();
    const id = [crypto.randomUUID()];
    const newReservation = {
      ...body,
      id,
    };
    await ResourceModel.insert(newReservation);
    return new Response(JSON.stringify(newReservation), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
