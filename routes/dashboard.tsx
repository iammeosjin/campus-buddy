// routes/dashboard.tsx
import { Head } from '$fresh/runtime.ts';
import { Handlers } from '$fresh/server.ts';
import Header from '../islands/Header.tsx';
import DashboardSummary from '../islands/DashboardSummary.tsx';
import { authorize } from '../middlewares/authorize.ts';
import OperatorModel from '../models/operator.ts';
import { Operator } from '../types.ts';
import ResourceModel from '../models/resource.ts';
import UserModel from '../models/user.ts';
import ReservationModel from '../models/reservation.ts';

export const handler: Handlers = {
	async GET(req, ctx) {
		const username = authorize(req);
		if (!username) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/login' }, // Redirect to home if already logged in
			});
		}

		const operator = await OperatorModel.get([username]);
		if (!operator) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/logout' }, // Redirect to home if already logged in
			});
		}

		const trends = await ReservationModel.getTrends('monthly');
		const popularTypes = await ResourceModel.getPopularTypes();
		const peakHours = await ReservationModel.getPeakHours();
		const monthlyActiveUsers = await UserModel.getMonthlyActiveUsers();
		const cancelledRatio = await ReservationModel.getCancelledRatio();

		console.log('trends', trends);

		return ctx.render({
			operator,
			analytics: {
				trends,
				popularTypes,
				peakHours,
				cancelledRatio,
				monthlyActiveUsers,
			},
		});
	},
};

export default function Dashboard(
	{ data }: {
		data: {
			operator: Operator;
			analytics: {
				trends: Record<string, number>;
				popularTypes: { resource: string; count: number }[];
				peakHours: { hour: number; count: number }[];
				cancelledRatio: {
					total: number;
					cancelled: number;
					ratio: number;
				};
				monthlyActiveUsers: number;
			};
		};
	},
) {
	return (
		<>
			<Head>
				<title>CampusReservation Admin Dashboard</title>
				<link
					href='/css/theme.css'
					rel='stylesheet'
				/>
				<link
					href='/css/header.css'
					rel='stylesheet'
				/>
				<link
					href='/css/dashboard.css'
					rel='stylesheet'
				/>
				<script
					src='/js/chart.js' //"https://cdn.jsdelivr.net/npm/chart.js"
					defer
				/>
			</Head>
			<Header activePage='/dashboard' operator={data.operator} />
			<main class='container mx-auto p-6'>
				<h1
					class='text-4xl font-bold mb-6'
					style={{
						fontFamily:
							`'Segoe UI', 'Helvetica Neue', Arial, sans-serif;`,
					}}
				>
					Admin Dashboard
				</h1>
				<DashboardSummary data={data.analytics} />
			</main>
		</>
	);
}
