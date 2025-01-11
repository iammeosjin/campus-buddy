// deno-lint-ignore-file no-explicit-any
import { useState } from 'preact/hooks';
import FileUpload from '../islands/FileUpload.tsx';
import { Operator, User, UserRole } from '../types.ts';
import { toName } from '../library/to-name.ts';
import { UserStatus } from '../types.ts';

export default function UserTable(
  params: { users: User[]; operator: Operator },
) {
  const [users, setUsers] = useState(params.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<Partial<User>>({
    status: UserStatus.ACTIVE,
    role: UserRole.STUDENT,
  });
  const [isUpdate, setIsUpdate] = useState(false);

  const itemsPerPage = 10;

  // Filtered users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
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
  const handleDelete = async (sid: string) => {
    const response = await fetch(`/api/users/${sid}`, { method: 'DELETE' });
    if (!response.ok) return;
    const updatedUsers = users.filter((user) => user.sid !== sid);
    setUsers(updatedUsers);
  };

  // Handle new user submission
  const handleAddUser = async () => {
    const response = await fetch(`/api/users`, {
      method: 'POST',
      body: JSON.stringify({
        sid: user.sid,
        name: user.name?.toLowerCase(),
        email: user.email,
        status: user.status,
        role: user.role,
      }),
    });

    if (!response.ok) return;

    setUsers([...users, user as User]);
    setIsModalOpen(false);
    setUser({
      status: UserStatus.ACTIVE,
      role: UserRole.STUDENT,
    });
  };

  const handleUpdateUser = async () => {
    const response = await fetch(`/api/users/${user.sid}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: user.name?.toLowerCase(),
        status: user.status,
        role: user.role,
      }),
    });
    if (!response.ok) return;
    setIsUpdate(false);
    setIsModalOpen(false);
    setUser({
      status: UserStatus.ACTIVE,
      role: UserRole.STUDENT,
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
            <FileUpload uploadType='users' />
            <button
              class='button-primary'
              onClick={() => {
                setIsUpdate(false);
                setIsModalOpen(true);
              }}
            >
              Create User
            </button>
          </div>
        </div>

        {/* Table */}
        <table class='table'>
          <thead>
            <tr>
              <th>School ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              {params.operator.role === 'ADMIN' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.sid}</td>
                <td>{toName(user.name)}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                {params.operator.role === 'ADMIN' && (
                  <td>
                    <div class='flex space-x-2'>
                      <button
                        class='button-secondary'
                        onClick={() => handleDelete(user.sid)}
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
                        Update
                      </button>
                    </div>
                  </td>
                )}
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
                placeholder='School ID'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={user.sid}
                disabled={isUpdate}
                onInput={(e) =>
                  setUser({ ...user, sid: e.currentTarget.value })}
              />
              <input
                type='text'
                placeholder='Name'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={user.name}
                onInput={(e) =>
                  setUser({ ...user, name: e.currentTarget.value })}
              />
              <input
                type='email'
                placeholder='Email'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={user.email}
                disabled={isUpdate}
                onInput={(e) =>
                  setUser({ ...user, email: e.currentTarget.value })}
              />
              <select
                class='border border-gray-300 rounded-md p-2 w-full'
                value={user.role}
                onInput={(e) =>
                  setUser({
                    ...user,
                    role: e.currentTarget.value as UserRole,
                  })}
              >
                <option value='STUDENT'>Student</option>
                <option value='STAFF'>Staff</option>
              </select>
              <select
                class='border border-gray-300 rounded-md p-2 w-full'
                value={user.status}
                onInput={(e) =>
                  setUser({
                    ...user,
                    status: e.currentTarget.value as UserStatus,
                  })}
              >
                <option value={UserStatus.ACTIVE}>Active</option>
                <option value={UserStatus.INACTIVE}>Inactive</option>
                <option value={UserStatus.SUSPENDED}>Suspended</option>
              </select>
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
