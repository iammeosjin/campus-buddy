import { Handlers } from '$fresh/server.ts';
import UserModel from '../../models/user.ts';

export const handler: Handlers = {
  async POST(req) {
    const user = await req.json();
    await UserModel.insertUser(user);
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
};
