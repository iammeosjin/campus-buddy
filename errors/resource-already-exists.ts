export default class ResourceAlreadyExistsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'RESOURCE_ALREADY_EXISTS';
	}
}
