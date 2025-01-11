import DefaultModel from '../library/model.ts';
import { Operator } from '../types.ts';

class Model extends DefaultModel<Operator> {
  getPrefix() {
    return 'operators';
  }
}

const OperatorModel = new Model();

export default OperatorModel;
