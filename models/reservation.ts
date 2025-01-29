import DefaultModel from '../library/model.ts';
import { Reservation } from '../types.ts';

class Model extends DefaultModel<Reservation> {
	override getPrefix() {
		return 'reservations';
	}

	async getTrends(range: 'daily' | 'weekly' | 'monthly') {
		const now = new Date();
		const rangeStart = new Date();
		if (range === 'daily') rangeStart.setDate(now.getDate() - 1);
		else if (range === 'weekly') rangeStart.setDate(now.getDate() - 7);
		else if (range === 'monthly') rangeStart.setMonth(now.getMonth() - 1);

		const reservations = await this.list();
		const trends = reservations.filter((res) => {
			const startDate = new Date(res.dateTimeStarted);
			return startDate >= rangeStart && startDate <= now;
		});

		const groupedTrends = trends.reduce((acc, res) => {
			const dateKey = new Date(res.dateTimeStarted).toDateString();
			acc[dateKey] = (acc[dateKey] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return groupedTrends;
	}

	async getPeakHours() {
		const reservations = await this.list();
		const hours = reservations.reduce((acc, res) => {
			const hour = new Date(res.dateTimeStarted).getHours();
			acc[hour] = (acc[hour] || 0) + 1;
			return acc;
		}, {} as Record<number, number>);

		return Object.entries(hours)
			.sort((a, b) => b[1] - a[1])
			.map(([hour, count]) => ({ hour: parseInt(hour), count }));
	}

	async getCancelledRatio() {
		const reservations = await this.list();
		const total = reservations.length;
		const cancelled =
			reservations.filter((res) => res.status === 'CANCELLED').length;

		return { total, cancelled, ratio: (cancelled / total) * 100 };
	}

	async getReservationsByMonth(month: number, year: number) {
		const allReservations = await this.list();
		return allReservations.filter((reservation) => {
			const date = new Date(reservation.dateStarted);
			return date.getMonth() === month && date.getFullYear() === year;
		});
	}
}

const ReservationModel = new Model();

export default ReservationModel;
