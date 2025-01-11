import { Handlers } from '$fresh/server.ts';
import OperatorModel from '../../models/operator.ts';

export const handler: Handlers = {
  async POST(req) {
    const operator = await req.json();
    const headers = new Headers();
    if (!operator.username || !operator.password) {
      return new Response('Invalid Data', {
        status: 400, // See Other
        headers,
      });
    }
    await OperatorModel.insert({
      ...operator,
      id: [operator.username],
    });

    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
};
