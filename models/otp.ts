import DefaultModel from '../library/model.ts';
import { OTP } from '../types.ts';

class Model extends DefaultModel<OTP> {
	override getPrefix() {
		return 'otps';
	}
}

const OTPModel = new Model();

export default OTPModel;
