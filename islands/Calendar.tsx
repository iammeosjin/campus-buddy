// islands/Calendar.tsx
import { useEffect, useState } from 'preact/hooks';
import { Reservation } from '../type.ts';

export default function Calendar() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    // Fetch reservation data from your API
    fetch('/api/reservations')
      .then((res) => res.json())
      .then((data) => setReservations(data));
  }, []);
  return (
    <div class='calendar'>
      {/* Simple calendar structure. Can integrate FullCalendar or similar library */}
      {reservations.map((res) => (
        <div key={res.id} class='reservation'>
          {res.name} - {res.date}
        </div>
      ))}
    </div>
  );
}
