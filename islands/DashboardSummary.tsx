import Chart from './Chart.tsx';

export default function DashboardSummary({
	data: {
		trends,
		popularTypes,
		peakHours,
		cancelledRatio,
		monthlyActiveUsers,
	},
}: {
	data: {
		trends: Record<string, number>;
		popularTypes: { resource: string; count: number }[];
		peakHours: { hour: number; count: number }[];
		cancelledRatio: { total: number; cancelled: number; ratio: number };
		monthlyActiveUsers: number;
	};
}) {
	const trendsChartData = {
		labels: Object.keys(trends),
		datasets: [
			{
				label: 'Reservations',
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
				label: 'Popular Resources',
				data: popularTypes.map(({ count }) => count),
				backgroundColor: [
					'#0088FE',
					'#00C49F',
					'#FFBB28',
					'#FF8042',
					'#A020F0',
				],
			},
		],
	};

	const peakHoursChartData = {
		labels: peakHours.map(({ hour }) => `${hour}:00`),
		datasets: [
			{
				label: 'Peak Reservation Hours',
				data: peakHours.map(({ count }) => count),
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				borderColor: 'rgba(255, 99, 132, 1)',
				borderWidth: 2,
			},
		],
	};

	return (
		<div class='analytics-summary grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{/* Reservation Trends Chart */}
			<div class='card card-primary'>
				<h3 class='card-title'>Reservation Trends</h3>
				<Chart type='line' data={trendsChartData} />
			</div>

			{/* Popular Resource Types Chart */}
			<div class='card card-secondary'>
				<h3 class='card-title'>Popular Resource Types</h3>
				<Chart type='pie' data={popularTypesChartData} />
			</div>

			{/* Peak Reservation Hours Chart */}
			<div class='card card-tertiary'>
				<h3 class='card-title'>Peak Reservation Hours</h3>
				<Chart type='bar' data={peakHoursChartData} />
			</div>

			{/* Cancelled Bookings Ratio */}
			<div class='card card-secondary'>
				<h3 class='card-title'>Cancelled Bookings Ratio</h3>
				<p class='card-value'>
					{cancelledRatio.cancelled} out of {cancelledRatio.total}
					{' '}
					bookings (
					{cancelledRatio.ratio.toFixed(2)}%)
				</p>
			</div>

			{/* Monthly Active Users */}
			<div class='card card-primary'>
				<h3 class='card-title'>Monthly Active Users</h3>
				<p class='card-value text-3xl font-bold'>
					{monthlyActiveUsers}
				</p>
			</div>
		</div>
	);
}
