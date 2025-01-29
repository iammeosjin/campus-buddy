import ResourceAlreadyExists from '../errors/resource-already-exists.ts';
import DefaultModel from '../library/model.ts';
import { ID, User } from '../types.ts';
import mergeDeepRight from 'https://deno.land/x/ramda@v0.27.2/source/mergeDeepRight.js';
import ReservationModel from './reservation.ts';

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
			throw new ResourceAlreadyExists(
				'User with ID or email already exists',
			);
		}
	}

	async updateUser(id: ID, update: Partial<Omit<User, 'id'>>) {
		const getRes = await this.kv.get<User>([this.getPrefix(), ...id]);
		if (getRes.value === null) return;
		const user = mergeDeepRight(getRes.value, update);
		const primaryKey = [this.getPrefix(), user.sid];
		const byEmailKey = [`${this.getPrefix()}_by_email`, user.email];
		const res = await this.kv.atomic()
			.set(primaryKey, user)
			.set(byEmailKey, user)
			.commit();
		if (!res.ok) {
			throw new ResourceAlreadyExists(
				'User with ID or email already exists',
			);
		}
	}

	async updateUserByEmail(email: string, update: Partial<Omit<User, 'id'>>) {
		const getRes = await this.kv.get<User>([
			`${this.getPrefix()}_by_email`,
			email,
		]);
		if (getRes.value === null) return;
		const user = mergeDeepRight(getRes.value, update);
		const primaryKey = [this.getPrefix(), user.sid];
		const byEmailKey = [`${this.getPrefix()}_by_email`, user.email];
		const res = await this.kv.atomic()
			.set(primaryKey, user)
			.set(byEmailKey, user)
			.commit();
		if (!res.ok) {
			throw new ResourceAlreadyExists(
				'User with ID or email already exists',
			);
		}
	}

	async getUser(sid: string): Promise<User | null> {
		const res = await this.kv.get<User>([this.getPrefix(), sid]);
		return res.value;
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

	async getMonthlyActiveUsers() {
		const now = new Date();
		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(now.getMonth() - 1);

		const reservations = await ReservationModel.list();
		const activeUsers = new Set(
			reservations
				.filter((res) => new Date(res.dateTimeStarted) >= oneMonthAgo)
				.map((res) => JSON.stringify(res.user)),
		);

		return activeUsers.size;
	}
}

const UserModel = new Model();

export default UserModel;
