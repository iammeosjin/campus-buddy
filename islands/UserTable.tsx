// components/UserTable.tsx

export default function UserTable() {
  // Mock data for demonstration; replace with real data later
  const users = [
    { id: 1, name: 'Alice', role: 'Student', verified: false },
    { id: 2, name: 'Bob', role: 'Staff', verified: true },
  ];

  return (
    <table class='table'>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.role}</td>
            <td>{user.verified ? 'Verified' : 'Pending'}</td>
            <td>
              <button class='button-primary'>
                {user.verified ? 'Deactivate' : 'Verify'}
              </button>
              <button class='button-secondary'>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
