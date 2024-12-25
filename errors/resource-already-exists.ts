export default class ResourceAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RESOURCE_ALREADY_EXISTS';
  }
}
