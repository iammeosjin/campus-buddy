// routes/users.tsx

import { Head } from '$fresh/runtime.ts';
import LoginPage from '../islands/LoginPage.tsx';
import { Handlers } from '$fresh/server.ts';
import { authorize } from '../middlewares/authorize.ts';
import OperatorModel from '../models/operator.ts';
import { OperatorRole } from '../types.ts';

export const handler: Handlers = {
  async GET(req, ctx) {
    const session = authorize(req);
    if (session) {
      const headers = new Headers();

      const operator = await OperatorModel.get([session]);
      let location = '/login';
      if (!operator) {
        headers.set('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
        headers.set('Location', location);
      } else if (operator.role === OperatorRole.OPERATOR) {
        location = '/dashboard';
      } else {
        location = '/operators/users';
      }

      return new Response(null, {
        status: 302,
        headers: { Location: location }, // Redirect to home if already logged in
      });
    }

    return ctx.render();
  },
};

export default function Login() {
  return (
    <>
      <Head>
        <title>CampusReservation User Management</title>
        <link
          href='/css/theme.css'
          rel='stylesheet'
        />
        <link
          href='/css/header.css'
          rel='stylesheet'
        />
      </Head>
      <div>
        <LoginPage />
      </div>
    </>
  );
}
