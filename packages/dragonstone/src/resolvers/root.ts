import { AuthenticationError } from 'apollo-server-lambda';
import { Context } from '../context';

export const resolvers = {
  RootQuery: {
    show: qr<{ id: string }>('show', (root, args, context) => {
      return context.firebaseResolver.show.getShow(args.id);
    }),
    upcomingEpisode: qr<{ showId: string }>('upcomingEpisode', (root, args, context) => {
      return context.firebaseResolver.upcoming.getUpcomingEpisode(args.showId);
    }),
    nextEpisodeToWatch: qr<{ showId: string }>('nextEpisodeToWatch', (root, args, context) => {
      const uid = context.uid;
      if (!uid) {
        throw new AuthenticationError('must authenticate');
      }
      return context.firebaseResolver.episode.getNextEpisodeToWatch(uid, args.showId);
    }),
    season: qr<{ showId: string; season: number }>('season', (root, args, context) => {
      return context.firebaseResolver.episode.getSeason(args.showId, args.season);
    })
  }
};

function qr<A = void, R = void>(name: string, resolver: (root: R, args: A, context: Context) => Promise<any>) {
  return (root: R, args: A, context: Context) => {
    context.logger.log('Start resolver: ' + name);
    return resolver(root, args, context)
      .then(value => {
        context.logger.log('Resolver compleat: ' + name);
        return value;
      })
      .catch(error => {
        context.logger.error(`Reolver (${name}) endeds with error: ${error}`);
        return Promise.reject(error);
      });
  };
}
