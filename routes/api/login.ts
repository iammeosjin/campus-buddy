// routes/api/login.ts
import { Handlers } from '$fresh/server.ts';
import OperatorModel from '../../models/operator.ts';

export const handler: Handlers = {
  async POST(req) {
    const formData = await req.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const operator = await OperatorModel.get([username]);

    if (operator?.password === password) {
      const headers = new Headers();
      headers.set(
        'Set-Cookie',
        `session=${operator.username}; HttpOnly; Path=/`,
      );
      return new Response(JSON.stringify(operator), {
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
