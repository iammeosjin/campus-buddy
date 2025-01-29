import DefaultModel from '../library/model.ts';
import { Reservation } from '../types.ts';
//@deno-types=npm:@types/luxon
import { DateTime } from 'npm:luxon';

class Model extends DefaultModel<Reservation> {
	override getPrefix() {
		return 'reservations';
	}

	async getTrends(range: 'daily' | 'weekly' | 'monthly' | 'yearly') {
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
		} else if (range === 'yearly') {
			filter.start = DateTime.now().startOf('year').toJSDate();
			filter.end = DateTime.now().endOf('year').toJSDate();
		}

		const reservations = await this.list();
		const trends = reservations.filter((res) => {
			const startDate = new Date(res.dateTimeStarted);
			return startDate >= filter.start && startDate <= filter.end;
		});

		if (range === 'daily' || range === 'weekly') {
			// Initialize empty days of the week
			const days = Array(7).fill(0);
			trends.forEach((res) => {
				const dayIndex = DateTime.fromISO(res.dateTimeStarted).weekday -
					1; // 0 = Monday
				days[dayIndex] += 1;
			});

			return {
				Monday: days[0],
				Tuesday: days[1],
				Wednesday: days[2],
				Thursday: days[3],
				Friday: days[4],
				Saturday: days[5],
				Sunday: days[6],
			};
		} else if (range === 'yearly') {
			// Initialize empty months of the year
			const months = Array(12).fill(0);
			trends.forEach((res) => {
				const monthIndex = DateTime.fromISO(res.dateTimeStarted).month -
					1; // 0 = January
				months[monthIndex] += 1;
			});

			return {
				January: months[0],
				February: months[1],
				March: months[2],
				April: months[3],
				May: months[4],
				June: months[5],
				July: months[6],
				August: months[7],
				September: months[8],
				October: months[9],
				November: months[10],
				December: months[11],
			};
		} else {
			// Monthly trends (default: days of the month)
			const startDate = DateTime.fromJSDate(filter.start);
			const endDate = DateTime.fromJSDate(filter.end);
			const allDays: Record<number, number> = {};

			for (
				let date = startDate;
				date <= endDate;
				date = date.plus({ days: 1 })
			) {
				allDays[date.day as number] = 0; // Initialize each day with 0 reservations
			}

			trends.forEach((res) => {
				const dateKey = DateTime.fromISO(res.dateTimeStarted)
					.day as number;
				allDays[dateKey] += 1;
			});

			return allDays;
		}
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
