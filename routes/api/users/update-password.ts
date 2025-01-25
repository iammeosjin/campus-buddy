import { Handlers } from '$fresh/server.ts';
import omit from 'https://deno.land/x/ramda@v0.27.2/source/omit.js';
import UserModel from '../../../models/user.ts';

export const handler: Handlers = {
	async POST(req) {
		const body = await req.json();
		await UserModel.updateUserByEmail(body.email, omit(['email'], body));
		const headers = new Headers();
		return new Response(null, {
			status: 200, // See Other
			headers,
		});
	},
};
