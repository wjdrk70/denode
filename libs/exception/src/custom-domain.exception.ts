export abstract class CustomDomainException extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
