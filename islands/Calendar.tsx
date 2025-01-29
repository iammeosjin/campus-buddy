import { toName } from '../library/to-name.ts';
import { ID, Operator, Reservation, Resource } from '../types.ts';
import { useState } from 'preact/hooks';

type ResourceDoc = Omit<Resource, 'creator'> & { creator: Operator };

export default function Calendar({
	reservations,
	resources,
	initialMonth,
	initialYear,
	searchTerm,
}: {
	reservations: Reservation[];
	resources: ResourceDoc[];
	initialMonth: number;
	initialYear: number;
	searchTerm: string;
}) {
	const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
	const [selectedYear, setSelectedYear] = useState<number>(initialYear);

	const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
	const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

	const getResourceName = (resourceId: ID): string => {
		const resource = resources.find((res) =>
			JSON.stringify(res.id) === JSON.stringify(resourceId)
		);
		return resource ? toName(resource.name) : 'Unknown';
	};

	let resource: ResourceDoc | undefined;

	if (searchTerm) {
		resource = resources.find((res) =>
			res.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}

	const getReservationsForDay = (day: number) => {
		return reservations.filter((res) => {
			const date = new Date(res.dateStarted);
			const selectedDate = date.getDate() === day &&
				date.getMonth() === selectedMonth &&
				date.getFullYear() === selectedYear;

			if (searchTerm) {
				return selectedDate &&
					JSON.stringify(res.resource) ===
						JSON.stringify(resource?.id || []);
			}
			return selectedDate;
		});
	};

	// Generate calendar days with leading empty slots
	const calendarDays = [
		...Array(firstDayOfMonth).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	];

	const handleMonthChange = (increment: number) => {
		const newDate = new Date(selectedYear, selectedMonth + increment);
		setSelectedMonth(newDate.getMonth());
		setSelectedYear(newDate.getFullYear());
	};

	return (
		<section class='calendar-section'>
			<div class='calendar-container'>
				<div class='calendar-header'>
					<button
						class='calendar-navigation button-secondary'
						onClick={() => handleMonthChange(-1)}
					>
						Previous
					</button>
					<h2 class='calendar-month-title'>
						{new Date(selectedYear, selectedMonth).toLocaleString(
							'default',
							{
								month: 'long',
								year: 'numeric',
							},
						)}
					</h2>
					<button
						class='calendar-navigation button-secondary'
						onClick={() => handleMonthChange(1)}
					>
						Next
					</button>
				</div>
				<div class='calendar-grid'>
					{calendarDays.map((day, index) => {
						if (day === null) {
							return (
								<div
									key={`empty-${index}`}
									class='calendar-day empty'
								>
								</div>
							);
						}

						const dayReservations = getReservationsForDay(day);
						return (
							<div class='calendar-day' key={day}>
								<div class='day-number'>{day}</div>
								<div class='reservations'>
									{dayReservations.map((res) => (
										<div
											key={res.id.join(';')}
											class='reservation-item'
											title={`${
												getResourceName(res.resource)
											} (${
												new Date(res.dateTimeStarted)
													.toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})
											})`}
										>
											{getResourceName(res.resource)}
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
