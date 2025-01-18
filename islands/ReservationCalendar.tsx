// deno-lint-ignore-file no-explicit-any
// components/ReservationCalendar.tsx
import { useState } from 'preact/hooks';
import equals from 'https://deno.land/x/ramda@v0.27.2/source/equals.js';
//@deno-types=npm:@types/luxon
import { DateTime } from 'npm:luxon';
import { ID, Operator, Reservation, Resource, User } from '../types.ts';
import { toName } from '../library/to-name.ts';

type ReservationDoc = Omit<Reservation, 'resource' | 'user' | 'creator'> & {
  resource: Resource;
  user: User;
  creator: Operator;
};

export default function ReservationCalendar(
  params: {
    reservations: ReservationDoc[];
    operator: Operator;
    resources: Resource[];
    users: User[];
  },
) {
  const [items, setItems] = useState<ReservationDoc[]>(params.reservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [item, setItem] = useState<Partial<Reservation>>({
    status: 'APPROVED',
  });
  const [resourceSearch, setResourceSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [isResourceDropdownOpen, setIsResourceDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const itemsPerPage = 10;

  const handleDelete = async (sid: string) => {
    const response = await fetch(`/api/reservations/${sid}`, {
      method: 'DELETE',
    });
    if (!response.ok) return;
    const updatedItems = items.filter((item) => item.id.join(';') !== sid);
    setItems(updatedItems);
  };

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddReservation = async () => {
    const response = await fetch(`/api/reservations`, {
      method: 'POST',
      body: JSON.stringify(item),
    });

    if (!response.ok) return;

    const res = await response.json();
    setItems([{
      ...res,
      user: params.users.find((user) => user.sid === res.user[0]) as User,
      resource: params.resources.find((resource) =>
        equals(resource.id, res.resource)
      ) as Resource,
    }, ...items]);
    setIsModalOpen(false);
    setItem({
      status: 'APPROVED',
    });
  };

  const handleUpdateReservation = async () => {
    if (!item) return;
    const response = await fetch(`/api/reservations/${item.id?.join(';')}`, {
      method: 'PATCH',
      body: JSON.stringify(item),
    });
    if (!response.ok) return;
    setIsUpdate(false);
    setIsModalOpen(false);
    setItem({
      status: 'APPROVED',
    });
    window.location.reload();
  };

  // Filtered users based on search term
  const filteredUsers = items.filter(
    (item) => {
      return item.resource.name.toLowerCase().includes(
        searchTerm.toLowerCase(),
      ) ||
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    },
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const list = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

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
              Create Reservation
            </button>
          </div>
        </div>

        {/* Table */}
        <table class='table'>
          <thead>
            <tr>
              <th class='border px-4 py-2'>Resource</th>
              <th class='border px-4 py-2'>User</th>
              <th class='border px-4 py-2'>Location</th>
              <th class='border px-4 py-2'>Date</th>
              <th class='border px-4 py-2'>Time</th>
              <th class='border px-4 py-2'>Status</th>
              <th class='border px-4 py-2'>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((index) => {
              const dateStarted = DateTime.fromISO(index.dateStarted);
              const date = dateStarted.toFormat('yyyy-MM-dd');

              const dateTimeStarted = DateTime.fromISO(index.dateTimeStarted);
              const time = `${dateTimeStarted.toFormat('HH:mm')}`;
              return (
                <tr key={index.id.join('-')}>
                  <td>
                    <b>{toName(index.resource.name)}</b>
                  </td>
                  <td>
                    <b>{toName(index.user.name)}</b>
                  </td>
                  <td>{index.resource.location}</td>
                  <td>{date}</td>
                  <td>{time}</td>
                  <td>
                    <b>{index.status}</b>
                  </td>
                  <td>{index.remarks}</td>
                  <td>
                    <div class='flex space-x-2'>
                      <button
                        class='button-secondary'
                        onClick={() => handleDelete(index.id.join(';'))}
                      >
                        Delete
                      </button>
                      <button
                        class='button-primary'
                        onClick={() => {
                          setItem({
                            ...index,
                            resource: index.resource.id,
                            user: [index.user.sid],
                          } as any);
                          setIsUpdate(true);
                          setIsModalOpen(true);
                        }}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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

      {isModalOpen && (
        <div class='modal-overlay'>
          <div class='modal'>
            <h2 class='text-xl font-bold mb-4'>
              {isUpdate ? 'Update Reservation' : 'Create New Reservation'}
            </h2>
            <div class='space-y-4'>
              {/* Searchable Resource Input */}
              <div class='relative'>
                {isUpdate
                  ? (
                    <input
                      type='text'
                      placeholder='Remarks'
                      class='border border-gray-300 rounded-md p-2 w-full'
                      value={params.resources.find((res) =>
                        equals(res.id, item.resource as ID)
                      )?.name || ''}
                      disabled
                    />
                  )
                  : (
                    <input
                      type='text'
                      placeholder='Search Resource...'
                      class='border border-gray-300 rounded-md p-2 w-full'
                      value={resourceSearch || ''}
                      onInput={(e) => setResourceSearch(e.currentTarget.value)}
                      onFocus={() => {
                        setIsResourceDropdownOpen(true);
                        setIsUserDropdownOpen(false);
                      }}
                    />
                  )}

                {isResourceDropdownOpen && (
                  <div class='absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-auto z-10'>
                    {params.resources
                      .filter((res) =>
                        res.id.join(';').includes(
                          resourceSearch.toLowerCase(),
                        )
                      )
                      .map((resource) => (
                        <div
                          key={resource.id}
                          class='px-4 py-2 hover:bg-gray-200 cursor-pointer'
                          onClick={() => {
                            setItem({
                              ...item,
                              resource: resource.id,
                            });
                            setResourceSearch(resource.name);
                            setIsResourceDropdownOpen(false);
                          }}
                        >
                          {resource.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div class='relative'>
                {isUpdate
                  ? (
                    <input
                      type='text'
                      placeholder='Remarks'
                      class='border border-gray-300 rounded-md p-2 w-full'
                      value={params.users.find((res) =>
                        equals([res.sid], item.user as ID)
                      )?.name || ''}
                      disabled
                    />
                  )
                  : (
                    <input
                      type='text'
                      placeholder='Search User...'
                      class='border border-gray-300 rounded-md p-2 w-full'
                      value={userSearch || ''}
                      onInput={(e) => setUserSearch(e.currentTarget.value)}
                      onFocus={() => {
                        setIsUserDropdownOpen(true);
                        setIsResourceDropdownOpen(false);
                      }}
                    />
                  )}

                {isUserDropdownOpen &&
                  (
                    <div class='absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-auto z-10'>
                      {params.users
                        .filter((user) =>
                          user.name.toLowerCase().includes(
                            userSearch.toLowerCase(),
                          )
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            class='px-4 py-2 hover:bg-gray-200 cursor-pointer'
                            onClick={() => {
                              setItem({
                                ...item,
                                user: [user.sid],
                              });
                              setUserSearch(user.name);
                              setIsUserDropdownOpen(false);
                            }}
                          >
                            {user.name}
                          </div>
                        ))}
                    </div>
                  )}
              </div>
              {/* Searchable User Input */}
              <label>
                Date:
                <input
                  type='date'
                  class='border border-gray-300 rounded-md p-2 w-full'
                  value={item.dateStarted || ''}
                  onInput={(e) =>
                    setItem({ ...item, dateStarted: e.currentTarget.value })}
                />
              </label>

              {/* Time Picker */}
              <label>
                Time:
                <input
                  type='time'
                  class='border border-gray-300 rounded-md p-2 w-full'
                  value={item.dateTimeStarted || ''}
                  onInput={(e) =>
                    setItem({
                      ...item,
                      dateTimeStarted: e.currentTarget.value,
                    })}
                />
              </label>

              {/* Other Inputs */}
              <select
                class='border border-gray-300 rounded-md p-2 w-full'
                value={item.status}
                onInput={(e) =>
                  setItem({
                    ...item,
                    status: e.currentTarget.value as
                      | 'APPROVED'
                      | 'CANCELLED',
                  })}
              >
                <option value={'APPROVED'}>Approved</option>
                <option value={'CANCELLED'}>Cancelled</option>
              </select>
              <input
                type='text'
                placeholder='Remarks'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={item.remarks || ''}
                onInput={(e) =>
                  setItem({ ...item, remarks: e.currentTarget.value })}
              />
            </div>

            <div class='flex justify-end space-x-2 mt-4'>
              <button
                class='button-secondary'
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                class='button-primary'
                onClick={isUpdate
                  ? handleUpdateReservation
                  : handleAddReservation}
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
