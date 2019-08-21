import { Client } from 'pg';

export function setupSchema(client: Client) {
  client.query(`
  DROP VIEW IF EXISTS "public"."titles";

  DROP TABLE IF EXISTS "public"."following";
  CREATE SEQUENCE IF NOT EXISTS following_id_seq;
  CREATE TABLE "public"."following" (
      "id" int4 NOT NULL DEFAULT nextval('following_id_seq'::regclass),
      "user_id" int4 NOT NULL,
      "show_id" int4 NOT NULL,
      PRIMARY KEY ("id")
  );
  
  DROP TABLE IF EXISTS "public"."shows";
  CREATE SEQUENCE IF NOT EXISTS shows_id_seq;
  CREATE TABLE "public"."shows" (
      "id" int4 NOT NULL DEFAULT nextval('shows_id_seq'::regclass),
      "name" text NOT NULL,
      "external_id_imdb" varchar(10),
      "external_id_tvdb" int4 NOT NULL,
      "airs_first" varchar(10),
      "airs_time" varchar(10),
      "airs_day" int2,
      "genre" _text NOT NULL,
      "language" text,
      "network" text,
      "overview" text,
      "runtime" int2 NOT NULL,
      "ended" bool NOT NULL,
      "lastupdated" int4 NOT NULL,
      PRIMARY KEY ("id")
  );
  
  DROP TABLE IF EXISTS "public"."tv_watched";
  CREATE SEQUENCE IF NOT EXISTS tv_watched_id_seq;
  CREATE TABLE "public"."tv_watched" (
      "id" int4 NOT NULL DEFAULT nextval('tv_watched_id_seq'::regclass),
      "user_id" int4 NOT NULL,
      "show_id" int4 NOT NULL,
      "time" int4 NOT NULL,
      "type" int2 NOT NULL,
      "episodenumber" int4,
      PRIMARY KEY ("id")
  );
  
  DROP TABLE IF EXISTS "public"."users";
  CREATE SEQUENCE IF NOT EXISTS users_id_seq;
  CREATE TABLE "public"."users" (
      "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
      "firebase_id" text NOT NULL,
      "name" text NOT NULL,
      "api_key" text NOT NULL,
      PRIMARY KEY ("id")
  );
  
  CREATE VIEW "public"."titles" AS SELECT s.id,
      s.name,
      s.external_id_tvdb,
      s.lastupdated,
      count(f.id) AS followers
     FROM (shows s
       LEFT JOIN following f ON ((f.show_id = s.id)))
    GROUP BY s.id
    ORDER BY s.id;
  ALTER TABLE "public"."following" ADD FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id");
  ALTER TABLE "public"."following" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
  ALTER TABLE "public"."tv_watched" ADD FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id");

  DROP TABLE IF EXISTS "public"."episodes";
  CREATE TABLE "public"."episodes" (
    "show_id" int4 NOT NULL,
    "name" text NOT NULL,
    "first_aired" varchar(10) NOT NULL,
    "overview" text,
    "lastupdated" int4 NOT NULL,
    "episodenumber" int4 NOT NULL,
    "external_id_tvdb" int4 NOT NULL DEFAULT 7121402,
    CONSTRAINT "episodes_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id"),
    PRIMARY KEY ("show_id","episodenumber")
  );
  `);
}
