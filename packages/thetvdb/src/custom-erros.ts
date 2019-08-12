export class TooManyEpisodes extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = this.constructor.name
  }
}

export class NotFound extends Error {
  constructor(msg?: string) {
    super(msg)
    this.name = this.constructor.name
  }
}
