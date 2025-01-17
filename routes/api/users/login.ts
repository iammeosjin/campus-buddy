// routes/api/login.ts
import { Handlers } from '$fresh/server.ts';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';
import UserModel from '../../../models/user.ts';
import key from '../../../library/key.ts';

export const handler: Handlers = {
  async POST(req) {
    const formData = await req.json();
    const user = await UserModel.getUserByEmail(formData.email);
    console.log('user', user, formData);
    if (formData?.password === user?.password) {
      const headers = new Headers();
      const jwt = await create(
        { alg: 'HS256', typ: 'JWT' },
        { userId: user?.sid, iss: 'cm', exp: getNumericDate(60 * 60) },
        key,
      );
      return new Response(JSON.stringify({ token: jwt }), {
        status: 200,
        headers,
      });
    }

    // Redirect back to the login page with an error message
    return new Response('Invalid username or password', {
      status: 401,
    });
  },
};
