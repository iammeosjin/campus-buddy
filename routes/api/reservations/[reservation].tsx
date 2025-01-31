// deno-lint-ignore-file no-explicit-any
import { Handlers } from '$fresh/server.ts';
import { authorize } from '../../../library/authorize.ts';
import ReservationModel from '../../../models/reservation.ts';
import UserModel from '../../../models/user.ts';
import omit from 'https://deno.land/x/ramda@v0.27.2/source/omit.js';
import equals from 'https://deno.land/x/ramda@v0.27.2/source/equals.js';
//@deno-types=npm:@types/luxon
import { DateTime } from 'npm:luxon';
import { ID, UserStatus } from '../../../types.ts';
import NotificationModel from '../../../models/notification.ts';
import ResourceModel from '../../../models/resource.ts';
import { toName } from '../../../library/to-name.ts';
import { uploadToPinata } from '../../../library/ipfs.ts';

export const handler: Handlers = {
	async PATCH(req, ctx) {
		const formData = await req.formData();
		const body: Record<string, any> = {};

		for (const entry of formData.entries()) {
			const [key, value] = entry;
			if (key === 'requestFormImage' && value instanceof File) {
				body.requestFormImage = await uploadToPinata(value); // Handle file upload
			} else {
				body[key] = value;
			}
		}

		const data = await ReservationModel.get(
			ctx.params.reservation.split(';'),
		);

		await ReservationModel.insert({
			...data,
			...omit(
				['id', 'guid', 'dateTimeCreated', 'resource', 'user'],
				body,
			),
		});

		const reservation = await ReservationModel.get(
			ctx.params.reservation.split(';'),
		);
		const resource = await ResourceModel.get(reservation?.resource as ID);

		if (body.status === 'CANCELLED') {
			const user = await authorize(req);
			if (!user) {
				return new Response('User not authorized', {
					status: 403,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			const reservations = await ReservationModel.list().then((
				reservations,
			) => reservations.filter((res) =>
				equals(res.user, [user]) && res.status === 'CANCELLED'
			));

			if (reservations.length > 3) {
				await UserModel.updateUser([user], {
					status: UserStatus.SUSPENDED,
				});
			} else {
				const nid = crypto.randomUUID();
				await NotificationModel.insert({
					id: [...reservation!.user, nid],
					guid: nid,
					recepient: reservation!.user,
					reservation: reservation!.id,
					title: `${toName(resource!.name)} cancelled`,
					body: `${
						3 - reservations.length
					} more cancellations and your account will be suspended`,
					image: resource!.image,
					location: resource!.location,
					dateStarted: reservation!.dateStarted,
					dateTimeStarted: reservation!.dateTimeStarted,
					dateTimeCreated: new Date().toISOString(),
				});
			}
		} else if (body.status === 'APPROVED') {
			const nid = crypto.randomUUID();
			await NotificationModel.insert({
				id: [...reservation!.user, nid],
				guid: nid,
				recepient: reservation!.user,
				reservation: reservation!.id,
				title: `Reservation has been approved`,
				body: `${toName(resource!.name)} on ${
					DateTime.fromJSDate(new Date(reservation!.dateStarted))
						.toFormat('LLLL dd, yyyy')
				}`,
				image: resource!.image,
				location: resource!.location,
				dateStarted: reservation!.dateStarted,
				dateTimeStarted: reservation!.dateTimeStarted,
				dateTimeCreated: new Date().toISOString(),
			});
		}

		const headers = new Headers();
		return new Response(null, {
			status: 201, // See Other
			headers,
		});
	},
	async DELETE(_, ctx) {
		await ReservationModel.delete(ctx.params.reservation.split(';'));
		const headers = new Headers();
		return new Response(null, {
			status: 201, // See Other
			headers,
		});
	},
};
