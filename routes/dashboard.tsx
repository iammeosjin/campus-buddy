// routes/dashboard.tsx
import { Head } from '$fresh/runtime.ts';
import { Handlers } from '$fresh/server.ts';
import Header from '../islands/Header.tsx';
import DashboardSummary from '../islands/DashboardSummary.tsx';
import { authorize } from '../middlewares/authorize.ts';
import OperatorModel from '../models/operator.ts';
import {
  Operator,
  Reservation,
  Resource,
  ResourceStatus,
  User,
} from '../types.ts';
import ResourceModel from '../models/resource.ts';
import UserModel from '../models/user.ts';
import ReservationModel from '../models/reservation.ts';

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
    const resources = await ResourceModel.list();
    const reservations = await ReservationModel.list();

    return ctx.render({
      operator,
      users,
      resources: resources.map((res) =>
        res.status === ResourceStatus.AVAILABLE
      ),
      reservations: reservations.filter((res) => res.status === 'PENDING'),
    });
  },
};

export default function Dashboard(
  { data }: {
    data: {
      operator: Operator;
      users: User[];
      resources: Resource[];
      reservations: Reservation[];
    };
  },
) {
  return (
    <>
      <Head>
        <title>CampusReservation Admin Dashboard</title>
        <link
          href='/css/theme.css'
          rel='stylesheet'
        />
        <link
          href='/css/header.css'
          rel='stylesheet'
        />
        <link
          href='/css/dashboard.css'
          rel='stylesheet'
        />
      </Head>
      <Header activePage='/dashboard' operator={data.operator} />
      <main class='container mx-auto p-6'>
        <h1
          class='text-4xl font-bold mb-6'
          style={{
            fontFamily: `'Segoe UI', 'Helvetica Neue', Arial, sans-serif;`,
          }}
        >
          Admin Dashboard
        </h1>
        <DashboardSummary data={data} />
      </main>
    </>
  );
}
