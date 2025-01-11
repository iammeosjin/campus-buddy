import { Handlers } from '$fresh/server.ts';
import OperatorModel from '../../../models/operator.ts';

export const handler: Handlers = {
  async PATCH(req, ctx) {
    const body = await req.json();
    const operator = await OperatorModel.get([ctx.params.username]);
    console.log('operator', operator, ctx.params.username);
    await OperatorModel.insert({
      ...operator,
      ...body,
    });
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
  async DELETE(_, ctx) {
    await OperatorModel.delete([ctx.params.username]);
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
};
