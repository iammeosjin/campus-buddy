import DefaultModel from '../library/model.ts';
import { Reservation } from '../types.ts';

class Model extends DefaultModel<Reservation> {
	override getPrefix() {
		return 'reservations';
	}
}

const ReservationModel = new Model();

export default ReservationModel;
