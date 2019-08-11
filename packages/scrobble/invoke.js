process.env.ADD_SHOW_FUNCTION = 'mock-add-show'
process.env.EH_RED_KEEP_URL = 'http://localhost:4000/graphql'
process.env.EH_RED_KEEP_TOKEN = 'no-token'

const handler = require('./dist/handler')

const username = 'tjoskar'
const apikey = 'myapi'
const episodeInfo = {
  id: 260450,
  episode: 5,
  season: 2
}

handler
  .scrobbleEpisode(username, apikey, episodeInfo)
  .then(result => {
    console.log('We have a result', result)
  })
  .catch(error => {
    console.error(error)
  })
