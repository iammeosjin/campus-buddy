import { EmailClient } from 'https://deno.land/x/email/mod.ts';

export default new EmailClient({
	username: 'your_email@gmail.com',
	password: 'your_password',
	hostname: 'smtp.gmail.com',
	port: 587,
});
