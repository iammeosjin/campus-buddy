import { Handlers } from '$fresh/server.ts';
import { uploadToPinata } from '../../../library/ipfs.ts';
import ResourceModel from '../../../models/resource.ts';

export const handler: Handlers = {
  async PATCH(req, ctx) {
    const body = await req.formData();
    const newReservation: Record<string, any> = {
      name: body.get('name'),
      type: body.get('type'),
      capacity: body.get('capacity'),
      location: body.get('location'),
      status: body.get('status'),
      remarks: body.get('remarks'),
    };
    const file = body.get('image') as File;
    if (file) {
      newReservation.image = await uploadToPinata(file);
    }
    const id = ctx.params.resource.split(';');
    const resource = await ResourceModel.get(id);
    if (!resource) {
      return new Response('Resource not found', {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await ResourceModel.insert({
      ...resource,
      ...newReservation,
    });
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
  async DELETE(_, ctx) {
    await ResourceModel.delete(ctx.params.resource.split(';'));
    const headers = new Headers();
    return new Response(null, {
      status: 201, // See Other
      headers,
    });
  },
};
