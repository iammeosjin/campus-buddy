// routes/api/login.ts
import { Handlers } from '$fresh/server.ts';
import OTPModel from '../../../models/otp.ts';

export const handler: Handlers = {
	async POST(req) {
		const formData = await req.json();
		const otp = await OTPModel.get([formData.email]);
		if (!otp) {
			return new Response('Invalid email', {
				status: 401,
			});
		}

		if (otp.code !== formData.code) {
			return new Response('Invalid code', {
				status: 401,
			});
		}

		return new Response(null, {
			status: 200,
		});
	},
};
