// routes/api/reservations.ts
import { Handlers } from '$fresh/server.ts';
import { authorize } from '../../library/authorize.ts';
import NotificationModel from '../../models/notification.ts';

export const handler: Handlers = {
	async GET(req) {
		const sid: undefined | string | null = await authorize(req);

		if (!sid) {
			return new Response('User not authorized', {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const notifications = await NotificationModel.list({ prefix: [sid] });
		return new Response(
			JSON.stringify(
				notifications,
			),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	},
};
