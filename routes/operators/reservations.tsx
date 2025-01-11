// routes/reservations.tsx
import { Head } from '$fresh/runtime.ts';
import Header from '../../islands/Header.tsx';
import ReservationCalendar from '../../islands/ReservationCalendar.tsx';

export default function Reservations() {
  return (
    <>
      <Head>
        <title>CampusBuddy Reservations</title>
        <link
          href='/css/theme.css'
          rel='stylesheet'
        />
        <link
          href='/css/header.css'
          rel='stylesheet'
        />
      </Head>
      <Header activePage='/reservations' />
      <div class='p-4'>
        <h1 class='text-3xl font-bold mb-6'>Manage Reservations</h1>
        <ReservationCalendar />
      </div>
    </>
  );
}
