import { Handlers } from '$fresh/server.ts';
import { authorize } from '../../../library/authorize.ts';
import ReservationModel from '../../../models/reservation.ts';
import UserModel from '../../../models/user.ts';
import omit from 'https://deno.land/x/ramda@v0.27.2/source/omit.js';
import equals from 'https://deno.land/x/ramda@v0.27.2/source/equals.js';
import { UserStatus } from '../../../types.ts';

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

    if (body.status === 'CANCELLED') {
      const user = await authorize(req);
      if (!user) {
        return new Response('User not authorized', {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const reservations = await ReservationModel.list().then((reservations) =>
        reservations.filter((res) =>
          equals(res.user, [user]) && res.status === 'CANCELLED'
        )
      );

      if (reservations.length > 3) {
        await UserModel.updateUser([user], { status: UserStatus.SUSPENDED });
      }
    }
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
