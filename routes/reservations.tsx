// deno-lint-ignore-file no-explicit-any
// routes/reservations.tsx
import { Handlers } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import Header from '../islands/Header.tsx';
import Bluebird from 'npm:bluebird';
import ReservationCalendar from '../islands/ReservationCalendar.tsx';
import { authorize } from '../middlewares/authorize.ts';
import ResourceModel from '../models/resource.ts';
import OperatorModel from '../models/operator.ts';
import UserModel from '../models/user.ts';
import ReservationModel from '../models/reservation.ts';
import { Operator, Reservation, Resource, User } from '../types.ts';
import equals from 'https://deno.land/x/ramda@v0.27.2/source/equals.js';

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

		const resources = await ResourceModel.list();
		const users = await UserModel.list();
		const reservations = await ReservationModel.list();

		const creatorCache = new Map<string, Operator | null>();
		creatorCache.set(operator.id.join(';'), operator);

		const userCache = new Map<string, User | null>();
		const resourceCache = new Map<string, Resource | null>();
		const res = await Bluebird.map(
			reservations,
			(reservation: Reservation) => {
				// let creator = creatorCache.get(reservation.creator.join(';'));
				// if (!creator) {
				//   creator = await OperatorModel.get(reservation.creator);
				//   creatorCache.set(reservation.creator.join(';'), creator);
				// }

				let user = userCache.get(reservation.user.join(';'));
				if (!user) {
					user = users.find((u) =>
						equals([u.sid], reservation.user)
					) || null;
					userCache.set(reservation.user.join(';'), user);
				}

				let resource = resourceCache.get(
					reservation.resource.join(';'),
				);
				if (!resource) {
					resource = resources.find((u) =>
						u.id.join(';') === reservation.resource.join(';')
					) || null;
					resourceCache.set(
						reservation.resource.join(';'),
						resource,
					);
				}

				let status = reservation.status;
				if (new Date(reservation.dateStarted) < new Date()) {
					status = 'EXPIRED';
				}

				return {
					...reservation,
					status,
					resource,
					user,
				};
			},
		).then((reservations: any) =>
			reservations.filter((reservation: any) => !!reservation)
		);

		console.log('res', res);
		return ctx.render({
			reservations: res,
			operator,
			resources,
			users,
		});
	},
};

export default function Reservations({ data }: {
	data: {
		reservations: (Omit<Reservation, 'resource' | 'user' | 'creator'> & {
			resource?: Resource;
			user?: User;
			creator: Operator;
		})[];
		operator: Operator;
		resources: Resource[];
		users: User[];
	};
}) {
	return (
		<>
			<Head>
				<title>CampusReservation Reservations</title>
				<link
					href='/css/theme.css'
					rel='stylesheet'
				/>
				<link
					href='/css/header.css'
					rel='stylesheet'
				/>
			</Head>
			<Header activePage='/reservations' operator={data.operator} />
			<div class='p-4'>
				<h1 class='text-3xl font-bold mb-6'>Manage Reservations</h1>
				<ReservationCalendar
					reservations={data.reservations}
					operator={data.operator}
					resources={data.resources}
					users={data.users}
				/>
			</div>
		</>
	);
}
