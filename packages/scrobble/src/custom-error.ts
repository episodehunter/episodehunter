export class UnableToAddShowError extends Error {
  constructor(msg: string, extra?: Record<string, unknown>) {
    super(msg)
    this.name = this.constructor.name
    ;(this as any).extra = extra
  }
}
