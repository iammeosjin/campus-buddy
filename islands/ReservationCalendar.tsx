// components/ReservationCalendar.tsx
import { useEffect, useState } from 'preact/hooks';
import { ReservationDoc } from '../type.ts';

// Mock API call function
const fetchReservations = (): Promise<ReservationDoc[]> => {
  // Replace with actual API call logic
  return Promise.resolve([
    {
      id: ['1'],
      name: 'Library Room A',
      userName: 'Alice',
      date: '2023-11-10',
      time: '10:00 AM - 11:00 AM',
      resource: {
        id: ['1'],
        name: 'Library Room A',
        capacity: 5,
        location: 'Library',
        status: 'Available',
      },
    },
    {
      id: ['2'],
      name: 'Lab Room B',
      userName: 'Bob',
      date: '2023-11-11',
      time: '2:00 PM - 3:00 PM',
      resource: {
        id: ['2'],
        name: 'Lab Room B',
        capacity: 10,
        location: 'Lab',
        status: 'Not Available',
        remarks: 'Under Maintenance',
      },
    },
  ]);
};

export default function ReservationCalendar() {
  const [reservations, setReservations] = useState<ReservationDoc[]>([]);

  useEffect(() => {
    fetchReservations().then((data) => setReservations(data));
  }, []);

  return (
    <div class='p-4'>
      <h2 class='text-2xl font-bold mb-4'>Reservations</h2>
      <table class='min-w-full bg-white border'>
        <thead>
          <tr>
            <th class='border px-4 py-2'>Resource</th>
            <th class='border px-4 py-2'>User</th>
            <th class='border px-4 py-2'>Date</th>
            <th class='border px-4 py-2'>Time</th>
            <th class='border px-4 py-2'>Status</th>
            <th class='border px-4 py-2'>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res.id}>
              <td class='border px-4 py-2'>{res.name}</td>
              <td class='border px-4 py-2'>{res.userName}</td>
              <td class='border px-4 py-2'>{res.date}</td>
              <td class='border px-4 py-2'>{res.time}</td>
              <td class='border px-4 py-2'>
                <span
                  class={`px-2 py-1 rounded ${
                    res.resource.status === 'Available'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  } text-white`}
                >
                  {res.resource.status}
                </span>
              </td>
              <td class='border px-4 py-2'>{res.resource.remarks || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
