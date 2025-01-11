import DefaultModel from '../library/model.ts';
import { Resource } from '../types.ts';

class Model extends DefaultModel<Resource> {
  getPrefix() {
    return 'resources';
  }
}

const ResourceModel = new Model();

export default ResourceModel;
