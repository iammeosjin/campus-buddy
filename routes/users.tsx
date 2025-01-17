// routes/users.tsx
import { Handlers } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import Header from '../islands/Header.tsx';
import UserTable from '../islands/UserTable.tsx';
import UserModel from '../models/user.ts';
import { Operator, User } from '../types.ts';
import { authorize } from '../middlewares/authorize.ts';
import OperatorModel from '../models/operator.ts';

export const handler: Handlers = {
  async GET(req, ctx) {
    const username = authorize(req);
    if (!username) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login' }, // Redirect to home if already logged in
      });
    }

    const operator = await OperatorModel.get([username]);
    if (!operator) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/logout' }, // Redirect to home if already logged in
      });
    }

    const users = await UserModel.list();
    return ctx.render({
      users,
      operator,
    });
  },
};

export default function Users(
  { data }: { data: { users: User[]; operator: Operator } },
) {
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
      <Header activePage='/users' operator={data.operator} />
      <div class='p-4'>
        <h1 class='text-3xl font-bold mb-6'>Manage Users</h1>
        <UserTable users={data.users} operator={data.operator} />
      </div>
    </>
  );
}
