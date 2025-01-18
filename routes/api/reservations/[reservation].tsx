import { Handlers } from '$fresh/server.ts';
import ReservationModel from '../../../models/reservation.ts';
import omit from 'https://deno.land/x/ramda@v0.27.2/source/omit.js';

export const handler: Handlers = {
  async PATCH(req, ctx) {
    const body = await req.json();
    const operator = await ReservationModel.get(
      ctx.params.reservation.split(';'),
    );
    await ReservationModel.insert({
      ...operator,
      ...omit(['id', 'guid', 'dateTimeCreated'], body),
    });
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
  async DELETE(_, ctx) {
    await ReservationModel.delete(ctx.params.reservation.split(';'));
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
};
