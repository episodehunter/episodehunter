## Show updater

> Service to update and add new shows.

We can split up this service into two parts.

1. Show updater - update existing show
2. Show adder - add a new show

### Show updater

This function will receive events from the `scheduler` service. It will first fetch the latest information about the show from TheTvDB and create an HTTP event to Dragonstone to update the show. It will then also fetch all episodes and filter out all episodes that have been updated after the timestamp Dragonstone has.

For example, let's say we have the following title (event to the function):

```json
{
  "id": 1,
  "tvdbId": 12345,
  "lastupdated": 1000000000
}
```

that means we have updated this show on `1000000000`. So we do not need to update the episodes that have not been updated before `1000000000` so let's remove them from the list.

Send an HTTP request to Dragonstone with the request to update the episodes but only send the episodes that have been updated after `event.lastupdated`.

### Show adder

First, add the show to Dragonstone. Then add all episodes in a batch of 200.
