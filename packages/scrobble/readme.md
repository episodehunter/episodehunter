# Scrobble

Scrobble an episode from Plex, Kodi.

## How?

The client will emit an HTTP request which is handled by this service. We first ask Dragonstone if the show exists and if it does we ask for the show ID. If it does not exist we emit an emit to the `show-update` service to add the show and return the new show ID (sync event). If the show could not be added we stop here.

When we have a show ID we send an HTTP request to Dragonstone to scrobble the episode.

### Plex

For Plex, we are using a webhook that emits an HTTP request when the episode is ready to scrobble.

### Kodi

The Kodi users are using an addon that also emits an HTTP request when the episode is ready to scrobble.
