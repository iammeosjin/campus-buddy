// components/ResourceList.tsx
import { useEffect, useState } from 'preact/hooks';
import { Resource } from '../types.ts';

// Mock API call function
const fetchResources = () => {
  // Replace with actual API call logic
  return Promise.resolve([
    {
      id: ['1'],
      name: 'Library Room A',
      capacity: 20,
      location: 'Building A',
      status: 'Available',
    },
    {
      id: ['2'],
      name: 'Lab Room B',
      capacity: 15,
      location: 'Building B',
      status: 'Not Available',
      remarks: 'Under Maintenance',
    },
  ] as Resource[]);
};

export default function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    fetchResources().then((data) => setResources(data));
  }, []);

  return (
    <div class='p-4'>
      <h2 class='text-2xl font-bold mb-4'>Resource List</h2>
      <table class='min-w-full bg-white border'>
        <thead>
          <tr>
            <th class='border px-4 py-2'>Name</th>
            <th class='border px-4 py-2'>Capacity</th>
            <th class='border px-4 py-2'>Location</th>
            <th class='border px-4 py-2'>Status</th>
            <th class='border px-4 py-2'>Remarks</th>
            <th class='border px-4 py-2'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => (
            <tr key={resource.id}>
              <td class='border px-4 py-2'>{resource.name}</td>
              <td class='border px-4 py-2'>{resource.capacity}</td>
              <td class='border px-4 py-2'>{resource.location}</td>
              <td class='border px-4 py-2'>
                <span
                  class={`px-2 py-1 rounded ${
                    resource.status === 'Available'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  } text-white`}
                >
                  {resource.status}
                </span>
              </td>
              <td class='border px-4 py-2'>{resource.remarks || '-'}</td>
              <td class='border px-4 py-2'>
                <button class='bg-yellow-500 text-white px-2 py-1 mr-2 rounded'>
                  Edit
                </button>
                <button class='bg-red-500 text-white px-2 py-1 rounded'>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
