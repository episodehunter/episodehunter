const { Tmdb } = require('./dist')

const apikey = process.argv[2]
const type = process.argv[3]
const id = process.argv[4]

const tmdb = new Tmdb(apikey)

// node invoke.js <apikey> show 815
if (type === 'show') {
  tmdb
    .fetchShow(id, console.log)
    .then(show => console.log(show))
    .then(() => console.log('Done!'))
    .catch(error => console.error(error))
}
