import ResourceAlreadyExists from '../errors/resource-already-exists.ts';
import DefaultModel from '../library/model.ts';
import { ID, User } from '../types.ts';

class Model extends DefaultModel<User> {
  override getPrefix() {
    return 'users';
  }

  async insertUser(user: Omit<User, 'id'>) {
    const primaryKey = [this.getPrefix(), user.sid];
    const byEmailKey = [`${this.getPrefix()}_by_email`, user.email];
    const res = await this.kv.atomic()
      .check({ key: primaryKey, versionstamp: null })
      .check({ key: byEmailKey, versionstamp: null })
      .set(primaryKey, user)
      .set(byEmailKey, user)
      .commit();
    if (!res.ok) {
      throw new ResourceAlreadyExists('User with ID or email already exists');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const res = await this.kv.get<User>([
      `${this.getPrefix()}_by_email`,
      email,
    ]);
    return res.value;
  }

  async deleteUser(id: ID) {
    let res = { ok: false };
    while (!res.ok) {
      const getRes = await this.kv.get<User>([this.getPrefix(), ...id]);
      if (getRes.value === null) return;
      res = await this.kv.atomic()
        .check(getRes)
        .delete([this.getPrefix(), ...id])
        .delete([`${this.getPrefix()}_by_email`, getRes.value.email])
        .commit();
    }
  }
}

const UserModel = new Model();

export default UserModel;
