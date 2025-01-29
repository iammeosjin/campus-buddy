import DefaultModel from '../library/model.ts';
import { Reservation } from '../types.ts';
//@deno-types=npm:@types/luxon
import { DateTime } from 'npm:luxon';

class Model extends DefaultModel<Reservation> {
	override getPrefix() {
		return 'reservations';
	}

	async getTrends(range: 'daily' | 'weekly' | 'monthly') {
		const filter = { start: new Date(), end: new Date() };
		if (range === 'daily') {
			filter.start = DateTime.now().startOf('day').toJSDate();
			filter.end = DateTime.now().endOf('day').toJSDate();
		} else if (range === 'weekly') {
			filter.start = DateTime.now().startOf('week').toJSDate();
			filter.end = DateTime.now().endOf('week').toJSDate();
		} else if (range === 'monthly') {
			filter.start = DateTime.now().startOf('month').toJSDate();
			filter.end = DateTime.now().endOf('month').toJSDate();
		}

		const reservations = await this.list();
		const trends = reservations.filter((res) => {
			const startDate = new Date(res.dateTimeStarted);
			return startDate >= filter.start && startDate <= filter.end;
		});

		const groupedTrends = trends.reduce((acc, res) => {
			const dateKey = new Date(res.dateTimeStarted).toISOString();
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
