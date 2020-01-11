import { defineTable, Schema, NewTableRow, TableRow } from 'squid';

export type NewEpisodeRecord = NewTableRow<typeof episodesTable>;
export type EpisodeRecord = TableRow<typeof episodesTable>;

export type NewWatchedEpisodeRecord = Omit<NewTableRow<typeof watchedEpisodeTable>, 'type'> & { type: 0 | 1 | 2 | 3 | 4 };;
export type WatchedEpisodeRecord = Omit<TableRow<typeof watchedEpisodeTable>, 'type'> & { type: 0 | 1 | 2 | 3 | 4 };

export type NewShowRecord = NewTableRow<typeof showTable>;
export type ShowRecord = TableRow<typeof showTable>;

export type NewUserRecord = NewTableRow<typeof usersTable>;
export type UserRecord = TableRow<typeof usersTable>;

export type NewFollowingRecord = NewTableRow<typeof followingTable>;
export type FollowingRecord = TableRow<typeof followingTable>;

export type TitleRecord = TableRow<typeof titleTable>;

const episodesTable = defineTable('episodes', {
  id: Schema.default(Schema.Number),
  name: Schema.String,
  show_id: Schema.Number,
  external_id_tvdb: Schema.Number,
  episodenumber: Schema.Number,
  first_aired: Schema.String,
  overview: Schema.nullable(Schema.String),
  lastupdated: Schema.Number
});

const watchedEpisodeTable = defineTable('tv_watched', {
  id: Schema.default(Schema.Number),
  user_id: Schema.Number,
  show_id: Schema.Number,
  time: Schema.Number,
  type: Schema.Enum([0, 1, 2, 3, 4]),
  episodenumber: Schema.Number
});

const showTable = defineTable('shows', {
  id: Schema.default(Schema.Number),
  airs_first: Schema.nullable(Schema.String),
  airs_time: Schema.nullable(Schema.String),
  airs_day: Schema.nullable(Schema.Number),
  ended: Schema.Boolean,
  genre: Schema.Array(Schema.String),
  external_id_imdb: Schema.nullable(Schema.String),
  external_id_tvdb: Schema.Number,
  language: Schema.nullable(Schema.String),
  /** Last (unix)time we check if the show should be updated */
  lastupdated_check: Schema.Number,
  /** Last (unix)time the show was updated */
  lastupdated: Schema.Number,
  name: Schema.String,
  network: Schema.nullable(Schema.String),
  overview: Schema.nullable(Schema.String),
  runtime: Schema.Number
});

const titleTable = defineTable('titles', {
  id: Schema.Number,
  name: Schema.String,
  external_id_tvdb: Schema.Number,
  lastupdated: Schema.Number,
  followers: Schema.Number,
  lastupdated_check: Schema.Number,
});

const usersTable = defineTable('users', {
  id: Schema.default(Schema.Number),
  firebase_id: Schema.String,
  name: Schema.String,
  api_key: Schema.String
});

const followingTable = defineTable('following', {
  id: Schema.default(Schema.Number),
  user_id: Schema.Number,
  show_id: Schema.Number
});
