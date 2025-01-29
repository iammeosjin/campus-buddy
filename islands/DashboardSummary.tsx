export default function AnalyticsSummary({
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
	return (
		<div class='analytics-summary grid gap-6 p-6'>
			<div>
				<h3>Reservation Trends</h3>
				<ul>
					{Object.entries(trends).map(([date, count]) => (
						<li key={date}>{date}: {count} reservations</li>
					))}
				</ul>
			</div>
			<div>
				<h3>Popular Resource Types</h3>
				<ul>
					{popularTypes.map(({ resource, count }) => (
						<li key={resource}>{resource}: {count}</li>
					))}
				</ul>
			</div>
			<div>
				<h3>Peak Reservation Hours</h3>
				<ul>
					{peakHours.map(({ hour, count }) => (
						<li key={hour}>{hour}: {count} reservations</li>
					))}
				</ul>
			</div>
			<div>
				<h3>Cancelled Bookings Ratio</h3>
				<p>
					{cancelledRatio.cancelled} out of {cancelledRatio.total}
					bookings ({cancelledRatio.ratio.toFixed(2)}%)
				</p>
			</div>
			<div>
				<h3>Monthly Active Users</h3>
				<p>{monthlyActiveUsers}</p>
			</div>
		</div>
	);
}
