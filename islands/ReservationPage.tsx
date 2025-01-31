// deno-lint-ignore-file no-explicit-any
// components/ReservationPage.tsx
import { useState } from 'preact/hooks';
import equals from 'https://deno.land/x/ramda@v0.27.2/source/equals.js';
//@deno-types=npm:@types/luxon
import { DateTime } from 'npm:luxon';
import { ID, Operator, Reservation, Resource, User } from '../types.ts';
import { toName } from '../library/to-name.ts';

type ReservationDoc = Omit<Reservation, 'resource' | 'user' | 'creator'> & {
	resource?: Resource;
	user?: User;
	creator: Operator;
};

export default function ReservationPage(
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
		dateTimeStarted: DateTime.now().startOf('hour').toFormat('HH:00'),
		dateTimeEnded: DateTime.now().plus({ hours: 1 }).startOf('hour')
			.toFormat('HH:00'),
	});
	const [requestFormImage, setRequestFormImage] = useState<File | null>(null);

	const handleProofUpload = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			setRequestFormImage(file);
		}
	};

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

	const handleSubmit = async () => {
		const formData = new FormData();
		formData.append('status', item.status || '');
		formData.append('dateTimeStarted', item.dateTimeStarted || '');
		formData.append('dateTimeEnded', item.dateTimeEnded || '');
		formData.append('dateStarted', item.dateStarted || '');
		formData.append('remarks', item.remarks || '');
		formData.append('resource', JSON.stringify(item.resource));
		formData.append('user', JSON.stringify(item.user));
		if (requestFormImage) {
			formData.append('requestFormImage', requestFormImage);
		}

		const url = isUpdate
			? `/api/reservations/${item.id?.join(';')}`
			: `/api/reservations`;
		const method = isUpdate ? 'PATCH' : 'POST';

		const response = await fetch(url, {
			method,
			body: formData,
		});

		if (!response.ok) {
			const data = await response.json();
			alert(data.message);
			return;
		}
		setIsUpdate(false);
		setIsModalOpen(false);
		globalThis.location.reload();
	};

	// Filtered users based on search term
	const filteredItems = items.filter(
		(item) => {
			return (!item.resource || item.resource.name.toLowerCase().includes(
				searchTerm.toLowerCase(),
			)) ||
				(!item.user ||
					item.user.name.toLowerCase().includes(
						searchTerm.toLowerCase(),
					));
		},
	);

	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const list = filteredItems.slice(
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
							setSearchTerm(
								((e.target as any)?.value || '') as string,
							)}
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
							<th>Request Form</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{list.map((index) => {
							return (
								<tr key={index.id.join('-')}>
									<td>
										<b>
											{toName(
												index.resource?.name || 'N/A',
											)}
										</b>
									</td>
									<td>
										<b>
											{toName(index.user?.name || 'N/A')}
										</b>
									</td>
									<td>{index.resource?.location || 'N/A'}</td>
									<td>
										{DateTime.fromISO(index.dateStarted)
											.toFormat('yyyy-MM-dd')}
									</td>
									<td>
										{`${
											DateTime.fromISO(
												index.dateTimeStarted,
											).toFormat('HH:mm')
										} - ${
											DateTime.fromISO(
												index.dateTimeEnded!,
											).toFormat('HH:mm')
										}`}
									</td>
									<td>
										<b>{index.status}</b>
									</td>
									<td>{index.remarks}</td>
									<td>
										{index.requestFormImage
											? (
												<a
													href={`https://gateway.pinata.cloud/ipfs/${index.requestFormImage}`}
													download
													class='text-blue-600 underline'
												>
													Preview
												</a>
											)
											: (
												<span class='text-gray-500'>
													No file
												</span>
											)}
									</td>
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
												disabled={index.status ===
														'EXPIRED' ||
													isUpdate || isModalOpen ||
													!index.resource ||
													!index.user}
												class={index.status ===
														'EXPIRED'
													? 'button-primary no-cursor'
													: 'button-primary'}
												onClick={() => {
													setItem({
														...index,
														resource:
															index.resource!.id,
														user: [index.user!.sid],
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
								? 'Update Reservation'
								: 'Create New Reservation'}
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
											value={params.resources.find((
												res,
											) => equals(
												res.id,
												item.resource as ID,
											))?.name || ''}
											disabled
										/>
									)
									: (
										<input
											type='text'
											placeholder='Search Resource...'
											class='border border-gray-300 rounded-md p-2 w-full'
											value={resourceSearch || ''}
											onInput={(e) =>
												setResourceSearch(
													e.currentTarget.value,
												)}
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
													resourceSearch
														.toLowerCase(),
												)
											)
											.map((resource) => (
												<div
													key={resource.id}
													class='px-4 py-2 hover:bg-gray-200 cursor-pointer'
													onClick={() => {
														setItem({
															...item,
															resource:
																resource.id,
														});
														setResourceSearch(
															resource.name,
														);
														setIsResourceDropdownOpen(
															false,
														);
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
												equals(
													[res.sid],
													item.user as ID,
												)
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
											onInput={(e) =>
												setUserSearch(
													e.currentTarget.value,
												)}
											onFocus={() => {
												setIsUserDropdownOpen(true);
												setIsResourceDropdownOpen(
													false,
												);
											}}
										/>
									)}

								{isUserDropdownOpen &&
									(
										<div class='absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-auto z-10'>
											{params.users
												.filter((user) =>
													user.name.toLowerCase()
														.includes(
															userSearch
																.toLowerCase(),
														)
												)
												.map((user) => (
													<div
														key={user.id}
														class='px-4 py-2 hover:bg-gray-200 cursor-pointer'
														onClick={() => {
															setItem({
																...item,
																user: [
																	user.sid,
																],
															});
															setUserSearch(
																user.name,
															);
															setIsUserDropdownOpen(
																false,
															);
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
									value={item.dateStarted
										? DateTime.fromISO(
											item.dateStarted,
										).toFormat('yyyy-MM-dd')
										: ''}
									onInput={(e) =>
										setItem({
											...item,
											dateStarted: e.currentTarget.value,
										})}
								/>
							</label>

							<div class='flex space-x-4'>
								{/* Start Time Input */}
								<div class='flex-1'>
									<label class='block text-sm font-medium text-gray-700'>
										Start Time:
									</label>
									<input
										type='time'
										step='3600'
										pattern='^([01][0-9]|2[0-3]):00$'
										class='border border-gray-300 rounded-md p-2 w-full'
										value={item.dateTimeStarted
											? DateTime.fromISO(
												item.dateTimeStarted,
											).toFormat('HH:mm')
											: ''}
										onInput={(e) => {
											const newStartTime =
												e.currentTarget.value;
											setItem({
												...item,
												dateTimeStarted: newStartTime,
												dateTimeEnded:
													item.dateTimeEnded &&
														newStartTime >=
															item.dateTimeEnded
														? DateTime.fromFormat(
															newStartTime,
															'HH:mm',
														).plus({ hours: 1 })
															.toFormat('HH:00')
														: item.dateTimeEnded,
											});
										}}
									/>
								</div>

								{/* End Time Input */}
								<div class='flex-1'>
									<label class='block text-sm font-medium text-gray-700'>
										End Time:
									</label>
									<input
										type='time'
										step='3600'
										pattern='^([01][0-9]|2[0-3]):00$'
										class='border border-gray-300 rounded-md p-2 w-full'
										value={item.dateTimeEnded
											? DateTime.fromISO(
												item.dateTimeEnded,
											).toFormat('HH:mm')
											: ''}
										onInput={(e) => {
											const newEndTime =
												e.currentTarget.value;
											if (
												newEndTime >
													item.dateTimeStarted!
											) {
												setItem({
													...item,
													dateTimeEnded: newEndTime,
												});
											} else {
												setItem({
													...item,
													dateTimeEnded: DateTime
														.fromFormat(
															item.dateTimeStarted!,
															'HH:mm',
														)
														.plus({ hours: 1 })
														.toFormat('HH:00'),
												});
											}
										}}
									/>
								</div>
							</div>

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
									setItem({
										...item,
										remarks: e.currentTarget.value,
									})}
							/>
							<label class='block text-sm font-medium text-gray-700'>
								Request Form Image:
							</label>
							<div class='file-input-container'>
								<input
									type='file'
									accept='image/*'
									class='file-upload-input'
									id='fileUpload'
									onChange={handleProofUpload}
								/>
								<label
									for='fileUpload'
									class='file-upload-label'
								>
									Choose File
								</label>
								<span class='file-name'>
									{requestFormImage
										? requestFormImage.name
										: 'No file chosen'}
								</span>
							</div>
						</div>

						<div class='flex justify-end space-x-2 mt-4'>
							<button
								class='button-secondary'
								onClick={() => {
									setItem({
										status: 'APPROVED',
										dateTimeStarted: DateTime.now().startOf(
											'hour',
										).toFormat('HH:00'),
										dateTimeEnded: DateTime.now().plus({
											hours: 1,
										}).startOf('hour')
											.toFormat('HH:00'),
									});
									setIsUpdate(false);
									setResourceSearch('');
									setUserSearch('');
									setIsModalOpen(false);
								}}
							>
								Cancel
							</button>
							<button
								class='button-primary'
								onClick={handleSubmit}
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
