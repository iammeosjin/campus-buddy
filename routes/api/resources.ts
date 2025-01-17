// deno-lint-ignore-file no-explicit-any
// routes/api/reservations.ts
import { Handlers } from '$fresh/server.ts';
import { uploadToPinata } from '../../library/ipfs.ts';
import ResourceModel from '../../models/resource.ts';
import { ID } from '../../types.ts';

export const handler: Handlers = {
  async POST(req) {
    const body = await req.formData();
    const id = [crypto.randomUUID()];
    const newReservation: { id: ID } & Record<string, any> = {
      name: body.get('name'),
      type: body.get('type'),
      capacity: body.get('capacity'),
      location: body.get('location'),
      status: body.get('status'),
      remarks: body.get('remarks'),
      creator: (body.get('creator') as string).split(';'),
      id,
    };
    const file = body.get('image') as File;
    if (file) {
      newReservation.image = await uploadToPinata(file);
    }

    await ResourceModel.insert(newReservation as any);
    return new Response(JSON.stringify(newReservation), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
