// routes/dashboard.tsx
import { Head } from '$fresh/runtime.ts';
import { Handlers } from '$fresh/server.ts';
import Header from '../islands/Header.tsx';
import DashboardSummary from '../islands/DashboardSummary.tsx';
import { authorize } from '../middlewares/authorize.ts';

export const handler: Handlers = {
  GET(req, ctx) {
    const username = authorize(req);
    if (!username) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login' }, // Redirect to home if already logged in
      });
    }

    return ctx.render();
  },
};

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>CampusBuddy Admin Dashboard</title>
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
      <Header activePage='/dashboard' />
      <main class='container mx-auto p-6'>
        <h1
          class='text-4xl font-bold mb-6'
          style={{
            fontFamily: `'Segoe UI', 'Helvetica Neue', Arial, sans-serif;`,
          }}
        >
          Admin Dashboard
        </h1>
        <DashboardSummary />
      </main>
    </>
  );
}
