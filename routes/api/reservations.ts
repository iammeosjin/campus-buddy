// routes/api/reservations.ts
import { Handlers } from '$fresh/server.ts';
import ResourceModel from '../../models/resource.ts';

export const handler: Handlers = {
  async POST(req) {
    const newReservation = await req.json();
    const id = [crypto.randomUUID()];
    await ResourceModel.insert({
      ...newReservation,
      id,
    });
    return new Response(JSON.stringify(newReservation), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
