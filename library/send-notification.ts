import {
	FcmClient,
	ServiceAccountCredentials,
} from 'https://deno.land/x/deno_firebase_fcm@1.0.2/mod.ts';

const fcmClient = new FcmClient({
	'type': 'service_account',
	'project_id': 'test-firbase-6b9d3',
	'private_key_id': '7ca0020669459b145e0d839967cbf5cab82ab0a6',
	'private_key':
		'-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqgyEXJoyAh8SQ\nmIRm7kBCuXb5KVoBCz0a48ppGjMzTe6r5wMXFq11VfeueQieGgwPfy/Nh3H3qxPg\np7ZIW4EgDnL95C4A7Gv3O0Wm/AoYWKY1Zb6INEgezVAqXosTrTIOjmD9weaFbCLy\nOkH7N+jjPFXryNVDDdjX9uCmPh1Shzavqjwkko9GurBFRI6IZzVfUWuMiXCgk0Fo\nWhY0r80Tk/PogInjzm2LS2JdA/SxOSN5rfv3bF3EAY8qY04mvnL+y7zy4w/VRaYm\nnWJGLPW0UXNB1ByvU6wSSRTRRazhhfjPP7CfMBx6WFV/hmjz5whUzrLFiR3Icj5E\n/QaZv6exAgMBAAECggEAKaitcD5JFAr3rZsxuAMsHJE6/c+KT5h7FqOCO7D8wuNe\ntU2UzfKKsRDumUg1YIk9GpkoqPaXU9sOmXPoP1/p2ZbmJd02lx+sFiR7VTudTMr1\n2rRvu0/IsgvX8u4T3RwSz4ceL8lMpJrho9wzbCkCA2illlyELCSJLuSAiOVCnTuJ\nMFi5ZQRW88Yt6lSX1GlBZqYyH4nNCIwyR4e51TRid+l1l/5sF2zKU6xx6030AUou\nFVG5kMduPftZEZSnJKaji9F99dUZ6bCfCv4tZYkUW+z1WPZme7OCI3hCNz6o2+XM\nfSoawwNx6pJ80g+ezzbOHuu15RfeXr8tHsfaVvu1hQKBgQDXOXxg+9HRVMz5fQB4\n6kPcar6Ru5wkfqRgBZZnNngvxlawFx2aS/rL2QyuND7XHxVjK/taTSrCo6zi9s93\nsxnjrH0NB5PouOSVAxDQ+A+TNTqDq/X4mdCBFIo3AcSm6OsHROSCRyhgV5iabdnh\nhR38J5U3prdIgNf5yhn6ZhMJhQKBgQDK0RHcXMl0wMIx5lPm+ttLn2gZDtSoiP1h\naojbYa09xm506iPZT9doqKK5jSJi1QUDBL4PmrEXfQVwI4OEooxAI+3HJBQZp/TE\nShrx3u3HA7kdzP3FRaQjZq+nlx+W1v3M/OYIQQMGA2GrZlc4xOiD3XpQ92ud5P+P\nKnZfoJDHPQKBgQC889I3zz2hG2Mtcko03e8gF3MhvOVTwP+M8bre+JpBz06SIGkz\n6prP1snkMygsczSysY1l9TOiWFJTnL3+Z/ZFxUywYMPBYHoGPP/Jhs8dvXCW4yT6\n0geVG7RQoLPGmdylsB0yJ0jSdHUct26/KMBvfUzq4+ortDppKb7u8CishQKBgBGO\nYXZqzcF+ghDhuDeRVXRJWzB4GS5xlUVefHRJEz76s0sJjYrdH29e0Z8wOV7Gw8VM\nHsuo/1ViLBtV56eOjodq1MVdOSQzZrurEoQHYRvOFbMfsIPoEFpEJEZkjYZ4G8Yn\nyh3Cyuk1V7oHhNtUKDBp9pGVqUokrX6OFWsXshCdAoGBAKDkiCEAgpMvTLk0n+MV\nIk5NdazYWSUyCwL9d9T8fHlGvEgt93MlkStQkTdsrplmf3fNsRNjlfFtfKX1oNFy\nXN29Qg8RGSTKFpx+vmT2XqsYW6ZBjpKlOAso+EKsf8alq+GgOyfyyNcrcZhgAJc9\nMpN4KnrkjL9h28+Yspmx/BET\n-----END PRIVATE KEY-----\n',
	'client_email':
		'firebase-adminsdk-fbsvc@test-firbase-6b9d3.iam.gserviceaccount.com',
	'client_id': '113076796353676551528',
	'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
	'token_uri': 'https://oauth2.googleapis.com/token',
	'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
	'client_x509_cert_url':
		'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40test-firbase-6b9d3.iam.gserviceaccount.com',
	'universe_domain': 'googleapis.com',
} as ServiceAccountCredentials);

export default async function sendNotification({ title, topic, body }: {
	topic: string;
	title: string;
	body: string;
}) {
	if (Deno.env.get('ENVIRONMENT') !== 'development') return;

	const message = {
		notification: {
			title: title,
			body: body,
		},
		token: `/topics/${topic}`,
	};

	try {
		const response = await fcmClient.sendNotification(message);
		console.log('✅ FCM Response:', response);
	} catch (error) {
		console.error('❌ Error sending message:', error);
	}
}
