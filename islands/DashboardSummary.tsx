// components/DashboardSummary.tsx
import { useEffect, useState } from 'preact/hooks';

// Mock API call function
const fetchStats = () => {
  // Replace with actual API call logic
  return Promise.resolve({
    users: 120,
    resources: 15,
    pendingReservations: 5,
  });
};

export default function DashboardSummary() {
  const [stats, setStats] = useState({
    users: 0,
    resources: 0,
    pendingReservations: 0,
  });

  useEffect(() => {
    fetchStats().then((data) => setStats(data));
  }, []);

  return (
    <div class='dashboard-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      <div class='card card-primary'>
        <h3 class='card-title'>Total Users</h3>
        <p class='card-value'>120</p>
      </div>
      <div class='card card-secondary'>
        <h3 class='card-title'>Active Resources</h3>
        <p class='card-value'>15</p>
      </div>
      <div class='card card-tertiary'>
        <h3 class='card-title'>Pending Reservations</h3>
        <p class='card-value'>5</p>
      </div>
    </div>
  );
}
