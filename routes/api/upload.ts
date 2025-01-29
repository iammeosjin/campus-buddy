import { Handlers } from '$fresh/server.ts';
//@deno-types=npm:@types/bluebird
import Bluebird from 'npm:bluebird';
import UserModel from '../../models/user.ts';
import { parse } from 'https://deno.land/std@0.212.0/csv/mod.ts';
import {
	Operator,
	ResourceStatus,
	ResourceType,
	UserRole,
	UserStatus,
} from '../../types.ts';
import ResourceModel from '../../models/resource.ts';
import ResourceAlreadyExistsError from '../../errors/resource-already-exists.ts';

export const handler: Handlers = {
	async POST(req) {
		const body = await req.json();
		const type = req.headers.get('Upload-Type');
		const data = body.data;
		const oparator: Operator = body.operator;
		if (!data || !type) {
			return new Response(null, {
				status: 200,
			});
		}

		if (type === 'users') {
			const users = parse(
				data,
				{
					skipFirstRow: true, // Skip the header row
				},
			) as {
				'Schoold ID': string;
				Name: string;
				Email: string;
			}[];

			const existingEmails = new Set<string>();

			try {
				await Bluebird.mapSeries(users, async (user) => {
					if (!user['Schoold ID'] || !user['Name']) {
						throw new Error(
							`User ${
								user['Schoold ID'] || user['Email']
							} does not followed the criteria.`,
						);
					}
					const email = user['Email'];
					if (email) {
						if (existingEmails.has(email)) return;
						if (await UserModel.getUserByEmail(email)) return;
					}

					const sid = user['Schoold ID'];

					try {
						await UserModel.insertUser({
							sid: sid,
							name: user['Name'].toLowerCase(),
							email: email,
							status: UserStatus.INACTIVE,
							role: UserRole.STUDENT,
						});
					} catch (error) {
						if (
							(error as ResourceAlreadyExistsError).name !==
								'RESOURCE_ALREADY_EXISTS'
						) {
							throw error;
						}
					}
				});
			} catch (error) {
				return new Response(
					(error as ResourceAlreadyExistsError).message,
					{
						status: 400,
					},
				);
			}
		}

		if (type === 'resources') {
			const resources = parse(
				data,
				{
					skipFirstRow: true, // Skip the header row
				},
			) as {
				Name: string;
				Capacity: string;
				Location: string;
				Status: string;
				Remarks: string;
				Type: string; // STUDY_ROOM | LABORATORY | SPORT_FACULTY | SPORT_EQUIPMENT
			}[];
			const existingNames = new Set<string>();

			try {
				await Bluebird.mapSeries(resources, async (res) => {
					if (!res['Name']) {
						throw new Error(
							`Resource ${
								res['Name']
							} does not followed the criteria.`,
						);
					}
					const name = res['Name'];
					if (name && existingNames.has(name)) return;

					try {
						const id = [crypto.randomUUID()];
						await ResourceModel.insert({
							name,
							capacity: parseInt(res['Capacity']),
							location: res['Location'],
							status: res['Status'] as ResourceStatus,
							remarks: res['Remarks'],
							creator: oparator.id,
							image: '',
							type: res['Type'] as ResourceType,
							id,
						});
					} catch (error) {
						if (
							(error as ResourceAlreadyExistsError).name !==
								'RESOURCE_ALREADY_EXISTS'
						) {
							throw error;
						}
					}
				});
			} catch (error) {
				return new Response(
					(error as ResourceAlreadyExistsError).message,
					{
						status: 400,
					},
				);
			}
		}

		console.log('done');

		return new Response(null, {
			status: 200,
		});
	},
};
