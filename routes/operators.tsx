// routes/users.tsx
import { Handlers } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import Header from '../islands/Header.tsx';
import { Operator, OperatorRole } from '../types.ts';
import { authorize } from '../middlewares/authorize.ts';
import OperatorTable from '../islands/OperatorTable.tsx';
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

    const operators = await OperatorModel.list();
    return ctx.render({
      operators: operators.filter((operator) =>
        operator.role === OperatorRole.OPERATOR
      ),
    });
  },
};

export default function Users({ data }: { data: { operators: Operator[] } }) {
  return (
    <>
      <Head>
        <title>CampusBuddy Operator Management</title>
        <link
          href='/css/theme.css'
          rel='stylesheet'
        />
        <link
          href='/css/header.css'
          rel='stylesheet'
        />
      </Head>
      <Header activePage='/operators' />
      <div class='p-4'>
        <h1 class='text-3xl font-bold mb-6'>Manage Operators</h1>
        <OperatorTable operators={data.operators} />
      </div>
    </>
  );
}
