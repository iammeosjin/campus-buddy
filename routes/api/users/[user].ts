import { Handlers } from '$fresh/server.ts';
import UserModel from '../../../models/user.ts';

export const handler: Handlers = {
  async PATCH(req, ctx) {
    const body = await req.json();
    await UserModel.updateUser(ctx.params.user.split(';'), body);
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
  async DELETE(_, ctx) {
    await UserModel.deleteUser(ctx.params.user.split(';'));
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
};
