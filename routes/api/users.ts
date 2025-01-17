import { Handlers } from '$fresh/server.ts';
import UserModel from '../../models/user.ts';
import { UserStatus } from '../../types.ts';

export const handler: Handlers = {
  async POST(req) {
    const user = await req.json();

    const platform = await req.headers.get('X-PLATFORM');

    if (!platform) {
      const existingUser = await UserModel.getUser(user.sid);
      if (!existingUser) {
        return new Response('User does not exists in the system.', {
          status: 401,
        });
      }

      if (
        existingUser.status === UserStatus.ACTIVE ||
        existingUser.status === UserStatus.SUSPENDED
      ) {
        return new Response('Invalid user status.', {
          status: 401,
        });
      }

      await UserModel.updateUser([existingUser.sid], {
        status: UserStatus.ACTIVE,
      });

      return new Response(null, {
        status: 201, // See Other
        headers: new Headers(),
      });
    }

    await UserModel.insertUser(user);
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
};
