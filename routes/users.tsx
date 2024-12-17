// routes/users.tsx
import { Head } from '$fresh/runtime.ts';
import Header from '../islands/Header.tsx';
import UserTable from '../islands/UserTable.tsx';

export default function Users() {
  return (
    <>
      <Head>
        <title>CampusBuddy User Management</title>
        <link
          href='/css/theme.css'
          rel='stylesheet'
        />
        <link
          href='/css/header.css'
          rel='stylesheet'
        />
      </Head>
      <Header activePage='/users' />
      <div class='p-4'>
        <h1 class='text-3xl font-bold mb-6'>Manage Users</h1>
        <UserTable />
      </div>
    </>
  );
}
