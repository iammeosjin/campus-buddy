import { useEffect, useState } from 'preact/hooks';
import Chart from './Chart.tsx';
import { toName } from '../library/to-name.ts';

export default function DashboardSummary({
	data: {
		trends: initialTrends,
		popularTypes,
		peakHours,
		cancelledRatio,
		monthlyActiveUsers,
		topResources,
	},
}: {
	data: {
		trends: Record<string, number>;
		popularTypes: { resource: string; count: number }[];
		peakHours: { hour: number; count: number }[];
		cancelledRatio: { total: number; cancelled: number; ratio: number };
		monthlyActiveUsers: number;
		topResources: { resource: string; count: number }[];
	};
}) {
	const [selectedPeriod, setSelectedPeriod] = useState<
		'weekly' | 'monthly' | 'yearly'
	>('monthly');
	const [trends, setTrends] = useState(initialTrends);

	const getTrendLabels = () => {
		if (selectedPeriod === 'weekly') {
			return [
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
				'Friday',
				'Saturday',
				'Sunday',
			];
		} else if (selectedPeriod === 'yearly') {
			return [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			];
		} else {
			return Object.keys(trends).map((day) => `Day ${day}`);
		}
	};

	useEffect(() => {
		async function fetchTrends() {
			try {
				const response = await fetch(
					`/api/trends?period=${selectedPeriod}`,
				);
				if (response.ok) {
					const data = await response.json();
					setTrends(data);
				}
			} catch (error) {
				console.error('Error fetching trends:', error);
			}
		}

		fetchTrends();
	}, [selectedPeriod]);

	const trendsChartData = {
		labels: getTrendLabels(),
		datasets: [
			{
				label: `Reservations (${selectedPeriod})`,
				data: Object.values(trends),
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 2,
			},
		],
	};

	const popularTypesChartData = {
		labels: popularTypes.map(({ resource }) => resource),
		datasets: [
			{
				label: 'Resource Usage',
				data: popularTypes.map(({ count }) => count),
				backgroundColor: [
					'#FF6384',
					'#36A2EB',
					'#FFCE56',
					'#4BC0C0',
					'#9966FF',
				],
				borderWidth: 1,
			},
		],
	};

	const peakHoursChartData = {
		labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), // Generate labels for all 24 hours
		datasets: [
			{
				label: 'Peak Reservation Hours',
				data: peakHours.map(({ count }) => count), // Map the counts directly
				backgroundColor: 'rgba(153, 102, 255, 0.6)',
				borderColor: 'rgba(153, 102, 255, 1)',
				borderWidth: 2,
			},
		],
	};

	return (
		<div class='analytics-summary'>
			{/* Row 1: Reservation Trends */}
			<div class='card card-primary row-1'>
				<div class='flex justify-between items-center'>
					<h3 class='card-title'>Reservation Trends</h3>
					<select
						class='border border-gray-300 rounded-md p-2'
						value={selectedPeriod}
						onChange={(e) =>
							setSelectedPeriod(
								e.currentTarget.value as
									| 'weekly'
									| 'monthly'
									| 'yearly',
							)}
					>
						<option value='weekly'>Weekly</option>
						<option value='monthly'>Monthly</option>
						<option value='yearly'>Yearly</option>
					</select>
				</div>
				<Chart type='line' data={trendsChartData} />
			</div>

			{/* Row 2: Two Charts */}
			<div class='row-2'>
				<div class='card card-secondary'>
					<h3 class='card-title'>Popular Resource Types</h3>
					<Chart type='pie' data={popularTypesChartData} />
				</div>

				<div class='card card-tertiary'>
					<h3 class='card-title'>Peak Reservation Hours</h3>
					<Chart type='bar' data={peakHoursChartData} />
				</div>
			</div>

			{/* Row 3: Three Cards */}
			<div class='row-3'>
				<div class='card card-secondary'>
					<h3 class='card-title'>Cancelled Bookings Ratio</h3>
					<p class='card-value text-2xl font-bold'>
						{cancelledRatio.cancelled} out of {cancelledRatio.total}
						{' '}
						bookings ({cancelledRatio.ratio.toFixed(2)}%)
					</p>
				</div>

				<div class='card card-primary'>
					<p class='monthly-active-value'>{monthlyActiveUsers}</p>
					<h3 class='monthly-active-title'>Monthly Active Users</h3>
				</div>

				<div class='card card-tertiary'>
					<h3 class='card-title'>Top 3 Most Reserved Resources</h3>
					<ul class='list-none pl-0'>
						{topResources.slice(0, 3).map(({ resource, count }) => (
							<li key={resource} class='card-value-secondary'>
								<b>{toName(resource)}</b>: {count} reservations
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
