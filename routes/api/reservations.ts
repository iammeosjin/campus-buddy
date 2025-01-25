// routes/api/reservations.ts
import { Handlers } from '$fresh/server.ts';
import { authorize } from '../../library/authorize.ts';
import ReservationModel from '../../models/reservation.ts';
import NotificationModel from '../../models/notification.ts';
import ResourceModel from '../../models/resource.ts';
import UserModel from '../../models/user.ts';
import { toName } from '../../library/to-name.ts';
//@deno-types=npm:@types/luxon
import { DateTime } from 'npm:luxon';

export const handler: Handlers = {
	async POST(req) {
		const newReservation = await req.json();
		console.log('newReservation', newReservation);

		const resource = await ResourceModel.get(newReservation.resource);

		if (!resource) {
			return new Response(
				JSON.stringify({ message: 'Resource not found' }),
				{
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		const userId = await authorize(req);
		if (userId) {
			newReservation.user = [userId];
			newReservation.status = 'PENDING';
		}

		const user = await UserModel.get(newReservation.user);

		if (!user) {
			return new Response(
				JSON.stringify({ message: 'User not found' }),
				{
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		const guid = crypto.randomUUID();
		const id = [
			...newReservation.resource,
			...newReservation.user,
			guid,
		];

		if (newReservation.dateEnded) {
			newReservation.dateEnded = newReservation.dateStarted;
		}

		if (newReservation.dateTimeEnded) {
			newReservation.dateTimeEnded = newReservation.dateTimeStarted;
		}

		const response = {
			...newReservation,
			dateTimeCreated: new Date().toISOString(),
			guid,
			id,
		};

		await ReservationModel.insert(response);
		const nid = crypto.randomUUID();
		await NotificationModel.insert({
			id: [...response.user, nid],
			guid: nid,
			recepient: response.user,
			reservation: id,
			title: `${toName(user.name)} booked ${toName(resource.name)}`,
			body: `${toName(resource.location)} on ${
				DateTime.fromJSDate(new Date(newReservation.dateStarted))
					.toFormat('LLLL dd, yyyy')
			}`,
			image: resource.image,
			location: resource.location,
			dateStarted: newReservation.dateStarted,
			dateTimeStarted: newReservation.dateTimeStarted,
			dateTimeCreated: new Date().toISOString(),
		});

		return new Response(
			JSON.stringify(response),
			{
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	},
	async GET(req) {
		const platform = req.headers.get('X-PLATFORM');
		let user: undefined | string | null;
		if (platform === 'mobile') {
			user = await authorize(req);
		}
		let reservations = await ReservationModel.list().then((res) =>
			res.map((res) =>
				new Date(res.dateStarted) < new Date()
					? { ...res, status: 'EXPIRED' }
					: res
			)
		);

		if (user) {
			reservations = reservations.filter((res) =>
				res.user.join(';') === user
			);
		}

		return new Response(
			JSON.stringify(reservations),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	},
};
