// deno-lint-ignore-file no-explicit-any
// components/ResourceList.tsx
import { useState } from 'preact/hooks';
import { Resource, ResourceStatus } from '../types.ts';
import FileUpload from './FileUpload.tsx';
import { toName } from '../library/to-name.ts';

export default function ResourceList(params: { resources: Resource[] }) {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: ['1'],
      name: 'Library Room A',
      capacity: 20,
      location: 'Building A',
      status: ResourceStatus.AVAILABLE,
      creator: ['1'],
    },
    {
      id: ['2'],
      name: 'Lab Room B',
      capacity: 15,
      location: 'Building B',
      status: ResourceStatus.UNAVAILABLE,
      remarks: 'Under Maintenance',
      creator: ['1'],
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resource, setResource] = useState<Partial<Resource>>({
    status: ResourceStatus.AVAILABLE,
  });

  const itemsPerPage = 10;

  const handleDelete = async (sid: string) => {
    const response = await fetch(`/api/users/${sid}`, { method: 'DELETE' });
    if (!response.ok) return;
    const updatedUsers = resources.filter((resource) =>
      resource.id !== sid.split(';')
    );
    setResources(updatedUsers);
  };

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle new user submission
  const handleAddUser = async () => {
    const response = await fetch(`/api/resources`, {
      method: 'POST',
      body: JSON.stringify({
        ...resource,
        creator: ['1'],
      }),
    });

    if (!response.ok) return;

    const res = await response.json();
    setResources([...resources, res as Resource]);
    setIsModalOpen(false);
    setResource({
      status: ResourceStatus.AVAILABLE,
    });
  };

  const handleUpdateUser = async () => {
    if (!resource) return;
    const response = await fetch(`/api/resources/${resource.id?.join(';')}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...resource,
      }),
    });
    if (!response.ok) return;
    setIsUpdate(false);
    setIsModalOpen(false);
    setResource({
      status: ResourceStatus.AVAILABLE,
    });
  };

  const totalPages = Math.ceil(resources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const list = resources.slice(
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
            <FileUpload uploadType='resources' />
            <button
              class='button-primary'
              onClick={() => {
                setIsUpdate(false);
                setIsModalOpen(true);
              }}
            >
              Create Resource
            </button>
          </div>
        </div>

        {/* Table */}
        <table class='table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((index) => (
              <tr key={index.id.join('-')}>
                <td>{toName(index.name)}</td>
                <td>{index.capacity}</td>
                <td>{index.location}</td>
                <td>{index.status}</td>
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
                        setResource(index);
                        setIsUpdate(true);
                        setIsModalOpen(true);
                      }}
                    >
                      Update
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

      {
        /* Modal */
        /*
      id: ['2'],
      name: 'Lab Room B',
      capacity: 15,
      location: 'Building B',
      status: ResourceStatus.UNAVAILABLE,
      remarks: 'Under Maintenance',
      creator: ['1'],
      */
      }
      {isModalOpen && (
        <div class='fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50'>
          <div class='bg-white rounded-lg shadow-lg p-6 w-1/3'>
            <h2 class='text-xl font-bold mb-4'>Create New User</h2>
            <div class='space-y-4'>
              <input
                type='text'
                placeholder='Name'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={resource.name}
                onInput={(e) =>
                  setResource({ ...resource, name: e.currentTarget.value })}
              />
              <input
                type='text'
                placeholder='Capacity'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={resource.capacity}
                onInput={(e) =>
                  setResource({
                    ...resource,
                    capacity: parseInt(e.currentTarget.value),
                  })}
              />
              <input
                type='text'
                placeholder='Location'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={resource.location}
                onInput={(e) =>
                  setResource({
                    ...resource,
                    location: e.currentTarget.value,
                  })}
              />
              <select
                class='border border-gray-300 rounded-md p-2 w-full'
                value={resource.status}
                onInput={(e) =>
                  setResource({
                    ...resource,
                    status: e.currentTarget.value as ResourceStatus,
                  })}
              >
                <option value={ResourceStatus.UNAVAILABLE}>Unavailable</option>
                <option value={ResourceStatus.AVAILABLE}>Available</option>
              </select>
              <input
                type='text'
                placeholder='Location'
                class='border border-gray-300 rounded-md p-2 w-full'
                value={resource.remarks}
                onInput={(e) =>
                  setResource({
                    ...resource,
                    remarks: e.currentTarget.value,
                  })}
              />
            </div>
            <div class='flex justify-end space-x-2 mt-4'>
              <button
                class='button-secondary'
                onClick={() => {
                  if (isUpdate) {
                    setResource({});
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
