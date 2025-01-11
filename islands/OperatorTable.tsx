// deno-lint-ignore-file no-explicit-any
import { useState } from 'preact/hooks';
import { Operator, OperatorRole } from '../types.ts';
export default function UserTable(params: { operators: Operator[] }) {
  const [users, setUsers] = useState(params.operators);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<Partial<Operator>>({
    role: OperatorRole.OPERATOR,
  });
  const [isUpdate, setIsUpdate] = useState(false);

  const itemsPerPage = 10;

  // Filtered users based on search term
  const filteredUsers = users.filter(
    (user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  // Handle page change
  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle user deletion
  const handleDelete = async (username: string) => {
    const response = await fetch(`/api/operators/${username}`, {
      method: 'DELETE',
    });
    if (!response.ok) return;
    const updatedUsers = users.filter((user) => user.username !== username);
    setUsers(updatedUsers);
  };

  // Handle new user submission
  const handleAddUser = async () => {
    const response = await fetch(`/api/operators`, {
      method: 'POST',
      body: JSON.stringify({
        username: user.username,
        password: user.password?.toLowerCase(),
        role: user.role,
      }),
    });

    if (!response.ok) return;

    setUsers([...users, user as Operator]);
    setIsModalOpen(false);
    setUser({
      role: OperatorRole.OPERATOR,
    });
  };

  const handleUpdateUser = async () => {
    const response = await fetch(`/api/operators/${user.username}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: user.username?.toLowerCase(),
        password: user.password?.toLowerCase(),
        role: user.role,
      }),
    });
    if (!response.ok) return;
    setIsUpdate(false);
    setIsModalOpen(false);
    setUser({
      role: OperatorRole.OPERATOR,
    });
  };

  return (
    <div>
      <div class='container mx-auto px-4'>
        {/* Search and Upload Section */}
        <div class='flex justify-between items-center mb-4'>
          <input
            type='text'
            placeholder='Search...'
            class='border border-gray-300 rounded-md p-2 w-1/2'
            value={searchTerm}
            onInput={(e) =>
              setSearchTerm(((e.target as any)?.value || '') as string)}
          />
          <div class='flex space-x-2'>
            <button
              class='button-primary'
              onClick={() => {
                setIsUpdate(false);
                setIsModalOpen(true);
              }}
            >
              Create Operator
            </button>
          </div>
        </div>

        {/* Table */}
        <table class='table'>
          <thead>
            <tr>
              <th>Username</th>
              <th>Password</th>
              <th>Role</th>
              <th>Action</th> {/* New column for delete button */}
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{new Array(user.password.length).fill('*').join('')}</td>
                <td>
                  <b>{user.role}</b>
                </td>
                <td>
                  <div class='flex space-x-2'>
                    <button
                      class='button-secondary'
                      onClick={() => handleDelete(user.username)}
                    >
                      Delete
                    </button>
                    <button
                      class='button-primary'
                      onClick={() => {
                        setUser(user);
                        setIsUpdate(true);
                        setIsModalOpen(true);
                      }}
                    >
                      Update Password
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div class='flex justify-end items-center space-x-1 mt-4'>
          {/* Previous Button */}
          <button
            class='button-primary text-sm px-2 py-1'
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {/* Page Numbers */}
          <div class='flex space-x-1'>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show the first and last page
                if (page === 1 || page === totalPages) return true;

                // Show a sliding window around the current page
                return Math.abs(page - currentPage) <= 2;
              })
              .map((page) => (
                <button
                  key={page}
                  class={`${
                    page === currentPage
                      ? 'button-primary text-sm px-2 py-1'
                      : 'border border-gray-300 text-gray-600 text-sm px-2 py-1'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
          </div>

          {/* Next Button */}
          <button
            class='button-primary text-sm px-2 py-1'
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div class='fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50'>
          <div class='bg-white rounded-lg shadow-lg p-6 w-1/3'>
            <h2 class='text-xl font-bold mb-4'>
              {isUpdate ? 'Update' : 'Create New'} User
            </h2>
            <div class='space-y-4'>
              <input
                type='text'
                placeholder='Username'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={user.username}
                disabled={isUpdate}
                onInput={(e) =>
                  setUser({ ...user, username: e.currentTarget.value })}
              />
              <input
                type='password'
                placeholder='Password'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={user.password}
                onInput={(e) =>
                  setUser({ ...user, password: e.currentTarget.value })}
              />

              <input
                type='text'
                placeholder='Role'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={user.role}
                disabled={true}
                onInput={(e) =>
                  setUser({
                    ...user,
                    role: e.currentTarget.value as OperatorRole,
                  })}
              />
            </div>
            <div class='flex justify-end space-x-2 mt-4'>
              <button
                class='button-secondary'
                onClick={() => {
                  if (isUpdate) {
                    setUser({});
                  }
                  setIsModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                class='button-primary'
                onClick={isUpdate ? handleUpdateUser : handleAddUser}
              >
                {isUpdate ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
