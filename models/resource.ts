import Bluebird from 'npm:bluebird';
import DefaultModel from '../library/model.ts';
import { toName } from '../library/to-name.ts';
import { Resource } from '../types.ts';
import ReservationModel from './reservation.ts';

class Model extends DefaultModel<Resource> {
	override getPrefix() {
		return 'resources';
	}

	async getPopularTypes() {
		const reservations = await ReservationModel.list();

		// Use a Map to handle ID as a key
		const resourceCounts = new Map<string, number>();

		for (const res of reservations) {
			const resourceKey = JSON.stringify(res.resource); // Serialize the ID
			resourceCounts.set(
				resourceKey,
				(resourceCounts.get(resourceKey) || 0) + 1,
			);
		}

		// Map to resource names
		const resources = await ResourceModel.list();
		const result = Array.from(resourceCounts.entries()).map(
			([id, count]) => {
				const resource = resources.find((res) =>
					JSON.stringify(res.id) === id
				);
				return {
					resource: resource?.type
						? toName(resource?.type as string)
						: 'Unknown',
					count,
				};
			},
		);

		return result;
	}

	async getTopReservedResources() {
		const resources = await this.list();
		const reservationCounts: { resource: string; count: number }[] =
			await Bluebird.map(
				resources,
				async (resource: Resource) => {
					const reservations = await ReservationModel.list({
						prefix: resource.id,
					});
					return {
						resource: resource.name,
						count: reservations.length, // Assuming resources have a `reservations` field
					};
				},
			);

		return reservationCounts
			.sort((a, b) => b.count - a.count) // Sort by reservation count in descending order
			.slice(0, 3); // Take the top 3
	}
}

const ResourceModel = new Model();

export default ResourceModel;
