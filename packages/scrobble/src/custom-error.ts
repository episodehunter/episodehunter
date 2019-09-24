export class UnableToAddShowError extends Error {
  constructor(msg: string, extra?: object) {
    super(msg)
    this.name = this.constructor.name
    ;(this as any).extra = extra
  }
}
