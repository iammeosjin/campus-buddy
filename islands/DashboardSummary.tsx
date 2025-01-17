// components/DashboardSummary.tsx
import { useEffect, useState } from 'preact/hooks';
import { Reservation, Resource, User } from '../types.ts';

// Mock API call function
const fetchStats = () => {
  // Replace with actual API call logic
  return Promise.resolve({
    users: 120,
    resources: 15,
    pendingReservations: 5,
  });
};

export default function DashboardSummary(params: {
  data: {
    users: User[];
    resources: Resource[];
    reservations: Reservation[];
  };
}) {
  const { data } = params;
  return (
    <div class='dashboard-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-[var(--background-color)]'>
      <div class='card bg-[var(--primary-color)] text-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all'>
        <h3 class='card-title text-white text-xl font-semibold mb-2'>
          Total Users
        </h3>
        <p class='card-value text-4xl font-extrabold'>{data.users.length}</p>
      </div>
      <div class='card bg-[var(--highlight-color)] text-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all'>
        <h3 class='card-title text-xl font-semibold mb-2'>Active Resources</h3>
        <p class='card-value text-4xl font-extrabold'>
          {data.resources.length}
        </p>
      </div>
      <div class='card bg-[var(--error-color)] text-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all'>
        <h3 class='card-title text-xl font-semibold mb-2'>
          Pending Reservations
        </h3>
        <p class='card-value text-4xl font-extrabold'>
          {data.reservations.length}
        </p>
      </div>
    </div>
  );
}
