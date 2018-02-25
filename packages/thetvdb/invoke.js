const fs = require('fs')
const { promisify } = require('util')
const { TheTvDb } = require('./dist')

const writeFile = promisify(fs.writeFile)

const apikey = process.argv[2]
const userkey = process.argv[3]
const type = process.argv[4]
const id = process.argv[5]

const theTvDb = new TheTvDb(apikey, userkey)

if (type === 'episode') {
  theTvDb
    .fetchEpisodeImage(id)
    .then(buffer => writeFile('bucket/episode_' + id + '.jpg', buffer))
    .then(() => console.log('Done!'))
    .catch(error => console.error(error))
} else if (type === 'poster') {
  theTvDb
    .fetchShowPoster(id)
    .then(buffer => writeFile('bucket/poster_' + id + '.jpg', buffer))
    .then(() => console.log('Done!'))
    .catch(error => console.error(error))
} else if (type === 'fanart') {
  theTvDb
    .fetchShowFanart(id)
    .then(buffer => writeFile('bucket/fanart_' + id + '.jpg', buffer))
    .then(() => console.log('Done!'))
    .catch(error => console.error(error))
}
