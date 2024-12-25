// deno-lint-ignore-file no-explicit-any
// components/UserTable.tsx
import { useState } from 'preact/hooks';
import FileUpload from '../islands/FileUpload.tsx';
import { User } from '../types.ts';
import { toName } from '../library/to-name.ts';

export default function UserTable(params: { users: User[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filtered users based on search term
  const filteredUsers = params.users.filter(
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
          <div>
            <FileUpload uploadType='users' />
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
    </div>
  );
}
