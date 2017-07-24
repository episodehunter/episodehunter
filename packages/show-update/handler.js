'use strict';

function hej(theTvDb) {
  const show = db.getShowByTvDb(theTvDb);
  const needToUpdate = isOngoning(show);
  if (!needToUpdate) {
    return true;
  }
  const token = getTheTvDbToken();
  const tvdbShow = getShowFromThetvdb();
  const tvdbEpisodes = getEpisodesFromThetvdb();
  const episodes = db.getEpisodes(show.id);
  const newEpisodes = updateEpisodes(episodes, tvdbEpisodes);
  const newShow = updateShow(show, tvdbShow);
  newShow.commit();
  newEpisodes.commit();
  const episodesWithMissingImages = extractEpisodesThatMissImages();
  episodesWithMissingImages.map(episode => {
    const tvdbEpisode = getEpisodeFromThetvdb(episode.thtvdb);
    if (tvdbEpisode.path) {
      SNS.add(tvdbEpisode.path);
    }
  });
}

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
