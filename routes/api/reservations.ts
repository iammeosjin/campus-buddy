// deno-lint-ignore-file no-explicit-any
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
import Bluebird from 'npm:bluebird';
import { Reservation } from '../../types.ts';
import sendNotification from '../../library/send-notification.ts';
import { uploadToPinata } from '../../library/ipfs.ts';

export const handler: Handlers = {
	async POST(req) {
		const formData = await req.formData();
		const newReservation: any = {};

		// Extract form-data values
		for (const entry of formData.entries()) {
			console.log('entry', entry);
			const [key, value] = entry;
			if (key === 'requestFormImage' && value instanceof File) {
				newReservation[key] = await uploadToPinata(value);
			} else if (['resource', 'user'].includes(key)) {
				newReservation[key] = JSON.parse(value as string); // Parse JSON fields
			} else {
				newReservation[key] = value;
			}
		}

		// Get Resource & Validate
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

		// Get User ID
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

		const reservations = await ReservationModel.list({
			prefix: resource.id,
		}).then((ress) =>
			ress.filter((res) =>
				res.status === 'APPROVED' || res.status === 'PENDING'
			)
		);

		if (resource.capacity <= reservations.length) {
			return new Response(
				JSON.stringify({ message: 'Resource capacity not enough' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		// Generate Reservation ID
		const guid = crypto.randomUUID();
		const id = [...newReservation.resource, ...newReservation.user, guid];

		// Convert Dates
		newReservation.dateStarted = new Date(newReservation.dateStarted)
			.toISOString();
		newReservation.dateTimeStarted = DateTime.fromFormat(
			`${
				DateTime.fromISO(newReservation.dateStarted).toFormat(
					'MM/dd/yyyy',
				)
			} ${newReservation.dateTimeStarted}`,
			'MM/dd/yyyy HH:mm',
		).toISO();

		if (!newReservation.dateEnded) {
			newReservation.dateEnded = newReservation.dateStarted;
		}

		if (newReservation.dateTimeEnded) {
			newReservation.dateTimeEnded = DateTime.fromFormat(
				`${
					DateTime.fromISO(newReservation.dateStarted).toFormat(
						'MM/dd/yyyy',
					)
				} ${newReservation.dateTimeEnded}`,
				'MM/dd/yyyy HH:mm',
			).toISO();
		}

		try {
			reservations.map((res) => {
				const dateTimeStarted = DateTime.fromISO(res.dateTimeStarted);
				const dateTimeEnded = DateTime.fromISO(res.dateTimeEnded);
				console.log({
					dateTimeStarted,
					dateTimeEnded,
					newReservation,
				});
				if (
					DateTime.fromISO(newReservation.dateTimeStarted) >=
						dateTimeStarted &&
					DateTime.fromISO(newReservation.dateTimeStarted) <
						dateTimeEnded
				) {
					throw new Error('Conflict');
				}

				if (
					DateTime.fromISO(newReservation.dateTimeEnded) >
						dateTimeStarted &&
					DateTime.fromISO(newReservation.dateTimeEnded) <=
						dateTimeEnded
				) {
					throw new Error('Conflict');
				}

				if (
					DateTime.fromISO(newReservation.dateTimeStarted) <=
						dateTimeStarted &&
					DateTime.fromISO(newReservation.dateTimeEnded) >=
						dateTimeEnded
				) {
					throw new Error('Conflict');
				}
			});
		} catch {
			return new Response(
				JSON.stringify({ message: 'Time slot not available' }),
				{
					status: 409,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		// Create Reservation Response
		const response = {
			...newReservation,
			dateTimeCreated: new Date().toISOString(),
			guid,
			id,
		};

		// Store in Database
		await ReservationModel.insert(response);

		// Create Notification
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

		// Send Notification
		sendNotification({
			topic: 'general_notifications',
			title: 'New Reservation',
			body: `${toName(user.name)} booked ${toName(resource.name)}`,
		});

		return new Response(
			JSON.stringify(response),
			{
				status: 200,
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
				new Date(res.dateTimeStarted) < new Date()
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

	async DELETE() {
		const reservations = await ReservationModel.list();

		await Bluebird.map(
			reservations,
			(res: Reservation) => ReservationModel.delete(res.id),
		);

		return new Response(
			JSON.stringify(reservations),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	},
};
