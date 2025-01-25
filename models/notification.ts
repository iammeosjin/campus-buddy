import DefaultModel from '../library/model.ts';
import { Notification } from '../types.ts';

class Model extends DefaultModel<Notification> {
	override getPrefix() {
		return 'notifications';
	}
}

const NotificationModel = new Model();

export default NotificationModel;
