import { Handlers } from '$fresh/server.ts';
import ResourceModel from '../../../models/resource.ts';

export const handler: Handlers = {
  async PATCH(req, ctx) {
    const body = await req.json();
    const id = ctx.params.user.split(';');
    const resource = await ResourceModel.get(id);
    await ResourceModel.insert({
      ...resource,
      ...body,
      id,
    });
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
  async DELETE(_, ctx) {
    await ResourceModel.delete(ctx.params.user.split(';'));
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
};
