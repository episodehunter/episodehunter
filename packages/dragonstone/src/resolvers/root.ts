import { Context } from "../context";

export const resolvers = {
  RootQuery: {
    show: qr<{id: string}>('show', (root, args, context) => {
      return context.firebaseResolver.show.getShow(args.id)
    })
  }
}

function qr<A = void, R = void>(name: string, resolver: (root: R, args: A, context: Context) => Promise<any>) {
  return (root: R, args: A, context: Context) => {
    context.logger.log('Start resolver: ' + name)
    return resolver(root, args, context)
      .then(value => {
        context.logger.log('Resolver compleat: ' + name)
        return value
      })
      .catch(error => {
        context.logger.error(`Reolver (${name}) endeds with error: ${error}`)
        return Promise.reject(error)
      })
  }
}