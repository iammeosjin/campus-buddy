import { Handlers } from '$fresh/server.ts';
//@deno-types=npm:@types/bluebird
import Bluebird from 'npm:bluebird';
import UserModel from '../../models/user.ts';
import { parse } from 'https://deno.land/std@0.212.0/csv/mod.ts';
import { UserRole, UserStatus } from '../../types.ts';

export const handler: Handlers = {
  async POST(req) {
    const data = await req.text();
    const type = req.headers.get('Upload-Type');
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
        'Name': string;
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

          try {
            await UserModel.insertUser({
              sid: user['Schoold ID'],
              name: user['Name'].toLowerCase(),
              email: user['Email'],
              status: UserStatus.INACTIVE,
              role: UserRole.STUDENT,
            });
          } catch (error) {
            if (error.name !== 'RESOURCE_ALREADY_EXISTS') {
              throw error;
            }
          }
        });
      } catch (error) {
        console.error(error);
        return new Response(error.message, {
          status: 400,
        });
      }
    }

    console.log('done');

    return new Response(null, {
      status: 200,
    });
  },
};
