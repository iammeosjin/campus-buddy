// routes/api/trends.ts
import { Handlers } from '$fresh/server.ts';
import ReservationModel from '../../models/reservation.ts';

export const handler: Handlers = {
	async GET(req) {
		const url = new URL(req.url);
		const period = url.searchParams.get('period') || 'monthly';

		const trends = await ReservationModel.getTrends(
			period as 'weekly' | 'monthly' | 'yearly',
		);

		return new Response(JSON.stringify(trends), {
			headers: { 'Content-Type': 'application/json' },
		});
	},
};
