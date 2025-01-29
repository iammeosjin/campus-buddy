// deno-lint-ignore-file no-explicit-any
// components/ResourceList.tsx
import { useState } from 'preact/hooks';
import {
	Operator,
	OperatorRole,
	Resource,
	ResourceStatus,
	ResourceType,
} from '../types.ts';
import FileUpload from './FileUpload.tsx';
import { toName } from '../library/to-name.ts';

export default function ResourceList(
	params: {
		resources: (Omit<Resource, 'creator'> & { creator: Operator })[];
		operator: Operator;
	},
) {
	const [resources, setResources] = useState<
		(Omit<Resource, 'creator'> & { creator: Operator })[]
	>(params.resources);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isUpdate, setIsUpdate] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [resource, setResource] = useState<
		Partial<Omit<Resource, 'image'> & { image: File }>
	>({
		status: ResourceStatus.AVAILABLE,
		type: ResourceType.STUDY_ROOM,
	});

	const itemsPerPage = 10;

	const handleDelete = async (sid: string) => {
		const response = await fetch(`/api/resources/${sid}`, {
			method: 'DELETE',
		});
		if (!response.ok) return;
		const updatedUsers = resources.filter((resource) =>
			resource.id.join(';') !== sid
		);
		setResources(updatedUsers);
	};

	const changePage = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	// Handle new resource submission
	const handleAddUser = async () => {
		const formData = new FormData();
		formData.append('name', resource.name || '');
		formData.append('type', resource.type || '');
		formData.append('capacity', resource.capacity?.toString() || '');
		formData.append('location', resource.location || '');
		formData.append('status', resource.status || '');
		formData.append('remarks', resource.remarks || '');
		if (resource.image) {
			formData.append('image', resource.image as any); // Append the image file
		}
		formData.append('creator', params.operator.id.join(';'));
		const response = await fetch(`/api/resources`, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) return;

		const res = await response.json();
		setResources([...resources, {
			...res,
			image: res.image,
			creator: params.operator,
		}]);
		setIsModalOpen(false);
		setResource({
			status: ResourceStatus.AVAILABLE,
			type: ResourceType.STUDY_ROOM,
		});
		setImagePreview(null);
	};

	const handleImageUpload = (e: Event) => {
		const fileInput: any = e.target;
		const fileNameDisplay: any = document.getElementById('file-name');

		if (fileInput.files && fileInput.files[0]) {
			fileNameDisplay.textContent = fileInput.files[0].name;
		}

		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setImagePreview(reader.result as string); // Set the preview URL
				setResource({ ...resource, image: file }); // Update the resource state with the file
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUpdateUser = async () => {
		if (!resource) return;
		const formData = new FormData();
		formData.append('name', resource.name || '');
		formData.append('type', resource.type || '');
		formData.append('capacity', resource.capacity?.toString() || '');
		formData.append('location', resource.location || '');
		formData.append('status', resource.status || '');
		formData.append('remarks', resource.remarks || '');
		if (resource.image) {
			formData.append('image', resource.image as any); // Append the image file
		}
		const response = await fetch(
			`/api/resources/${resource.id?.join(';')}`,
			{
				method: 'PATCH',
				body: formData,
			},
		);
		if (!response.ok) return;
		setIsUpdate(false);
		setIsModalOpen(false);
		setResource({
			status: ResourceStatus.AVAILABLE,
			type: ResourceType.STUDY_ROOM,
		});
		setImagePreview(null);
		globalThis.location.reload();
	};

	// Filtered users based on search term
	const filteredUsers = resources.filter(
		(resource) =>
			resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			resource.location.toLowerCase().includes(
				searchTerm.toLowerCase(),
			) ||
			resource.remarks?.toLowerCase().includes(
				searchTerm.toLowerCase(),
			) ||
			resource.creator.username.toLowerCase().includes(
				searchTerm.toLowerCase(),
			),
	);

	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const list = filteredUsers.slice(
		startIndex,
		startIndex + itemsPerPage,
	);

	return (
		<>
			<section>
				<div class='container mx-auto px-4'>
					{/* Search and Upload Section */}
					<div class='flex justify-between items-center mb-4'>
						<input
							type='text'
							placeholder='Search...'
							class='border border-gray-300 rounded-md p-2 w-1/2'
							value={searchTerm}
							onInput={(e) =>
								setSearchTerm(
									((e.target as any)?.value || '') as string,
								)}
						/>
						<div class='flex space-x-2'>
							<FileUpload
								uploadType='resources'
								operator={params.operator}
							/>
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
								<th>Type</th>
								<th>Capacity</th>
								<th>Location</th>
								<th>Status</th>
								<th>Remarks</th>
								{params.operator.role === OperatorRole.ADMIN
									? <th>Creator</th>
									: <></>}
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{list.map((index) => (
								<tr key={index.id.join('-')}>
									<td>
										<b>{toName(index.name)}</b>
									</td>
									<td>{toName(index.type)}</td>
									<td>{index.capacity}</td>
									<td>{index.location}</td>
									<td>
										<b>{index.status}</b>
									</td>
									<td>{index.remarks}</td>
									{params.operator.role === OperatorRole.ADMIN
										? <td>{index.creator.username}</td>
										: <></>}
									<td>
										<div class='flex space-x-2'>
											<button
												class='button-secondary'
												onClick={() =>
													handleDelete(
														index.id.join(';'),
													)}
											>
												Delete
											</button>
											<button
												class='button-primary'
												onClick={() => {
													setResource({
														...index,
														creator:
															index.creator.id,
													} as any);
													setImagePreview(
														index.image,
													);
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
									if (page === 1 || page === totalPages) {
										return true;
									}

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
								{isUpdate
									? 'Update Resource'
									: 'Create New Resource'}
							</h2>
							<div class='space-y-4'>
								{/* Image Upload */}
								<div class='file-input-container'>
									<label
										for='file-upload'
										class='file-upload-label'
									>
										Choose File
									</label>
									<input
										id='file-upload'
										type='file'
										accept='image/*'
										class='file-upload-input'
										onChange={(event) =>
											handleImageUpload(event)}
									/>
									<span id='file-name' class='file-name'>
										No file chosen
									</span>
								</div>
								{/* Image Preview */}
								{imagePreview && (
									<div class='flex items-center justify-center'>
										<img
											src={imagePreview.includes(
													'data:image',
												)
												? imagePreview
												: `https://gateway.pinata.cloud/ipfs/${imagePreview}`}
											alt='Preview'
											class='h-32 w-32 object-cover rounded-md'
										/>
									</div>
								)}
								<select
									class='border border-gray-300 rounded-md p-2 w-full'
									value={resource.type}
									onInput={(e) =>
										setResource({
											...resource,
											type: e.currentTarget
												.value as ResourceType,
										})}
								>
									<option value={ResourceType.STUDY_ROOM}>
										Study Room
									</option>
									<option value={ResourceType.LABORATORY}>
										Laboratory
									</option>
									<option
										value={ResourceType.SPORT_EQUIPMENT}
									>
										Sport Equipment
									</option>
									<option value={ResourceType.SPORT_FACILITY}>
										Sport Facility
									</option>
									<option value={ResourceType.OTHERS}>
										Others
									</option>
								</select>
								<input
									type='text'
									placeholder='Name'
									class='border border-gray-300 rounded-md p-2 w-full'
									value={resource.name}
									onInput={(e) =>
										setResource({
											...resource,
											name: e.currentTarget.value,
										})}
								/>
								<input
									type='text'
									placeholder='Capacity'
									class='border border-gray-300 rounded-md p-2 w-full'
									value={resource.capacity}
									onInput={(e) =>
										setResource({
											...resource,
											capacity: parseInt(
												e.currentTarget.value,
											),
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
											status: e.currentTarget
												.value as ResourceStatus,
										})}
								>
									<option value={ResourceStatus.UNAVAILABLE}>
										Unavailable
									</option>
									<option value={ResourceStatus.AVAILABLE}>
										Available
									</option>
								</select>
								<input
									type='text'
									placeholder='Remarks'
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
										setImagePreview(null);
										setIsModalOpen(false);
									}}
								>
									Cancel
								</button>
								<button
									class='button-primary'
									onClick={isUpdate
										? handleUpdateUser
										: handleAddUser}
								>
									{isUpdate ? 'Update' : 'Create'}
								</button>
							</div>
						</div>
					</div>
				)}
			</section>
		</>
	);
}
