export class InsufficientShowInformation extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = this.constructor.name;
  }
}
