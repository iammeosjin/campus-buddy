// routes/api/login.ts
import { Handlers } from '$fresh/server.ts';
import UserModel from '../../../models/user.ts';
import OTPModel from '../../../models/otp.ts';

export const handler: Handlers = {
	async POST(req) {
		const formData = await req.json();
		const user = await UserModel.getUserByEmail(formData.email);
		if (!user) {
			return new Response('Invalid email', {
				status: 401,
			});
		}

		await OTPModel.insert({
			id: [user.email],
			email: user.email,
			code: '123456',
		});

		return new Response('Email sent', {
			status: 200,
		});
	},
};
