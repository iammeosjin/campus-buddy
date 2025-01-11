import DefaultModel from '../library/model.ts';
import { Reservation } from '../types.ts';

class Model extends DefaultModel<Reservation> {
  getPrefix() {
    return 'reservations';
  }
}

const ReservationModel = new Model();

export default ReservationModel;
