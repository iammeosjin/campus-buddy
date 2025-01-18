// routes/api/login.ts
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';
import UserModel from '../models/user.ts';
import key from './key.ts';

export async function authorize(req: Request): Promise<string | null> {
  const token = req.headers.get('Authorization');
  if (token) {
    const jwt = await verify(token.replace('Bearer', '').trim(), key);
    if (!await UserModel.getUser(jwt.userId as string)) {
      return null;
    }
    return jwt.userId as string;
  }
  return null;
}
