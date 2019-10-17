export class NotFound extends Error {
  constructor(msg?: string) {
    super(msg)
    this.name = this.constructor.name
  }
}

export class Timeout extends Error {
  constructor(msg?: string) {
    super(msg)
    this.name = this.constructor.name
  }
}
