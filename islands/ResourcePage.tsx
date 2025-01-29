// deno-lint-ignore-file no-explicit-any
// components/ResourcePage.tsx
import { useState } from 'preact/hooks';
import {
	Operator,
	Reservation,
	Resource,
	ResourceStatus,
	ResourceType,
} from '../types.ts';
import FileUpload from './FileUpload.tsx';
import ResourceTable from './ResourceTable.tsx';
import Calendar from './Calendar.tsx';

export default function ResourcePage(
	{ resources, operator, reservations, initialMonth, initialYear }: {
		resources: (Omit<Resource, 'creator'> & { creator: Operator })[];
		operator: Operator;
		reservations: Reservation[];
		initialMonth: number;
		initialYear: number;
	},
) {
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [resource, setResource] = useState<
		Partial<Omit<Resource, 'image'> & { image: File }>
	>({
		status: ResourceStatus.AVAILABLE,
		type: ResourceType.STUDY_ROOM,
	});

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

	const handleAddResource = async () => {
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
		formData.append('creator', operator.id.join(';'));
		const response = await fetch(`/api/resources`, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) return;

		setIsModalOpen(false);
		setResource({
			status: ResourceStatus.AVAILABLE,
			type: ResourceType.STUDY_ROOM,
		});
		setImagePreview(null);
		globalThis.location.reload();
	};

	return (
		<>
			<Calendar
				reservations={reservations}
				initialMonth={initialMonth}
				initialYear={initialYear}
				resources={resources}
				searchTerm={searchTerm}
			/>
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
							operator={operator}
						/>
						<button
							class='button-primary'
							onClick={() => {
								setIsModalOpen(true);
							}}
						>
							Create Resource
						</button>
					</div>
				</div>
			</div>

			<ResourceTable
				resources={resources}
				operator={operator}
				searchTerm={searchTerm}
			/>

			{isModalOpen && (
				<div class='modal-overlay'>
					<div class='modal'>
						<h2 class='text-xl font-bold mb-4'>
							Create New Resource
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
									setImagePreview(null);
									setIsModalOpen(false);
								}}
							>
								Cancel
							</button>
							<button
								class='button-primary'
								onClick={handleAddResource}
							>
								Create
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
