import { Client } from 'pg';

export function setupDatabas(client: Client) {
  return client.query(`
  DROP VIEW IF EXISTS "public"."titles" cascade;

  DROP TABLE IF EXISTS "public"."following" cascade;
  CREATE SEQUENCE IF NOT EXISTS following_id_seq;
  CREATE TABLE "public"."following" (
      "id" int4 NOT NULL DEFAULT nextval('following_id_seq'::regclass),
      "user_id" int4 NOT NULL,
      "show_id" int4 NOT NULL,
      PRIMARY KEY ("id")
  );
  SELECT setval('following_id_seq', 1, false);

  DROP TABLE IF EXISTS "public"."shows" cascade;
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
      "lastupdated_check" int4 NOT NULL DEFAULT 0,
      PRIMARY KEY ("id")
  );

  DROP TABLE IF EXISTS "public"."tv_watched" cascade;
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
  SELECT setval('tv_watched_id_seq', 1, false);

  DROP TABLE IF EXISTS "public"."users" cascade;
  CREATE SEQUENCE IF NOT EXISTS users_id_seq;
  CREATE TABLE "public"."users" (
      "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
      "firebase_id" text NOT NULL UNIQUE,
      "name" text NOT NULL,
      "api_key" text NOT NULL,
      "timezone" text,
      "auto_follow" bool NOT NULL DEFAULT true,
      "show_just_went" bool DEFAULT true,
      PRIMARY KEY ("id")
  );

  CREATE VIEW "public"."titles" AS SELECT s.id,
    s.name,
    s.external_id_tvdb,
    s.lastupdated,
    count(f.id) AS followers,
        CASE
            WHEN (s.lastupdated_check > 0) THEN s.lastupdated_check
            ELSE s.lastupdated
        END AS lastupdated_check
   FROM (shows s
     LEFT JOIN following f ON ((f.show_id = s.id)))
  GROUP BY s.id
  ORDER BY s.id;

  DROP TABLE IF EXISTS "public"."episodes" cascade;
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

  ALTER TABLE "public"."following" ADD FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id");
  ALTER TABLE "public"."following" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
  ALTER TABLE "public"."tv_watched" ADD FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id");
  ALTER TABLE "public"."tv_watched" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

  INSERT INTO "public"."shows" ("id", "name", "external_id_imdb", "external_id_tvdb", "airs_first", "airs_time", "airs_day", "genre", "language", "network", "overview", "runtime", "ended", "lastupdated", "lastupdated_check") VALUES ('1', 'Stranger Things', 'tt4574334', '305288', '2016-07-15', '03:00', '4', '{Adventure,Drama,Fantasy,Mystery}', 'en', 'Netflix', 'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying forces in order to get him back.', '50', 'f', '1555393924', '1999999999');
  INSERT INTO "public"."episodes" ("show_id", "name", "first_aired", "overview", "lastupdated", "episodenumber", "external_id_tvdb") VALUES ('1', 'Chapter One: The Vanishing of Will Byers', '2016-07-15', 'On his way home from a friend''s house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.', '1555393839', '10001', '7121402'),
    ('1', 'Chapter Two: The Weirdo on Maple Street', '2016-07-15', 'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.', '1555393859', '10002', '7121402'),
    ('1', 'Chapter Three: Holly, Jolly', '2016-07-15', 'An increasingly concerned Nancy looks for Barb and finds out what Jonathan''s been up to. Joyce is convinced Will is trying to talk to her.', '1555393868', '10003', '7121402'),
    ('1', 'Chapter Four: The Body', '2016-07-15', 'Refusing to believe Will is dead, Joyce tries to connect with her son. The boys give Eleven a makeover. Nancy and Jonathan form an unlikely alliance.', '1555393878', '10004', '7121402'),
    ('1', 'Chapter Five: The Flea and the Acrobat', '2016-07-15', 'Hopper breaks into the lab while Nancy and Jonathan confront the force that took Will. The boys ask Mr. Clarke how to travel to another dimension.', '1555393889', '10005', '7121402'),
    ('1', 'Chapter Six: The Monster', '2016-07-15', 'A frantic Jonathan looks for Nancy in the darkness, but Steve''s looking for her, too. Hopper and Joyce uncover the truth about the lab''s experiments.', '1555393899', '10006', '7121402'),
    ('1', 'Chapter Seven: The Bathtub', '2016-07-15', 'Eleven struggles to reach Will, while Lucas warns that "the bad men are coming." Nancy and Jonathan show the police what Jonathan caught on camera.', '1555393910', '10007', '7121402'),
    ('1', 'Chapter Eight: The Upside Down', '2016-07-15', 'Dr. Brenner holds Hopper and Joyce for questioning while the boys wait with Eleven in the gym. Back at Will''s, Nancy and Jonathan prepare for battle.', '1555393924', '10008', '7121402'),
    ('1', 'Chapter One: MADMAX', '2017-10-27', 'As the town preps for Halloween, a high-scoring rival shakes things up at the arcade, and a skeptical Hopper inspects a field of rotting pumpkins.', '1511264468', '20001', '7121402'),
    ('1', 'Chapter Two: Trick or Treat, Freak', '2017-10-27', 'After Will sees something terrible on trick-or-treat night, Mike wonders whether Eleven''s still out there. Nancy wrestles with the truth about Barb.', '1511022362', '20002', '7121402'),
    ('1', 'Chapter Three: The Pollywog', '2017-10-27', 'Dustin adopts a strange new pet, and Eleven grows increasingly impatient. A well-meaning Bob urges Will to stand up to his fears.', '1510342244', '20003', '7121402'),
    ('1', 'Chapter Four: Will the Wise', '2017-10-27', 'An ailing Will opens up to Joyce -- with disturbing results. While Hopper digs for the truth, Eleven unearths a surprising discovery.', '1510262656', '20004', '7121402'),
    ('1', 'Chapter Five: Dig Dug', '2017-10-27', 'Nancy and Jonathan swap conspiracy theories with a new ally as Eleven searches for someone from her past. “Bob the Brain” tackles a difficult problem.', '1510558733', '20005', '7121402'),
    ('1', 'Chapter Six: The Spy', '2017-10-27', 'Will''s connection to a shadowy evil grows stronger, but no one''s quite sure how to stop it. Elsewhere, Dustin and Steve forge an unlikely bond.', '1510262689', '20006', '7121402'),
    ('1', 'Chapter Seven: The Lost Sister', '2017-10-27', 'Psychic visions draw Eleven to a band of violent outcasts and an angry girl with a shadowy past.', '1511022392', '20007', '7121402'),
    ('1', 'Chapter Eight: The Mind Flayer', '2017-10-27', 'An unlikely hero steps forward when a deadly development puts the Hawkins Lab on lockdown, trapping Will and several others inside.', '1511022426', '20008', '7121402'),
    ('1', 'Chapter Nine: The Gate', '2017-10-27', 'Eleven makes plans to finish what she started while the survivors turn up the heat on the monstrous force that''s holding Will hostage.', '1510262735', '20009', '7121402'),
    ('1', 'Suzie, Do You Copy?', '2019-07-04', NULL, '1553890429', '30001', '7121402'),
    ('1', 'The Mallrats', '2019-07-04', NULL, '1553890457', '30002', '7121402'),
    ('1', 'The Case of the Missing Lifeguard', '2019-07-04', NULL, '1553890492', '30003', '7121402'),
    ('1', 'The Sauna Test', '2019-07-04', NULL, '1553890506', '30004', '7121402'),
    ('1', 'The Source', '2019-07-04', NULL, '1553890525', '30005', '7121402'),
    ('1', 'The Birthday', '2019-07-04', NULL, '1553890540', '30006', '7121402'),
    ('1', 'The Bite', '2019-07-04', NULL, '1553890559', '30007', '7121402'),
    ('1', 'The Battle of Starcourt', '2019-07-04', NULL, '1553890590', '30008', '7121402');

  INSERT INTO "public"."shows" ("id", "name", "external_id_imdb", "external_id_tvdb", "airs_first", "airs_time", "airs_day", "genre", "language", "network", "overview", "runtime", "ended", "lastupdated", "lastupdated_check") VALUES ('2', 'Breaking Bad', 'tt0903747', '81189', '2008-01-20', '21:00', '6', '{Crime,Drama,Suspense,Thriller}', 'en', 'AMC', 'Walter White, a struggling high school chemistry teacher, is diagnosed with advanced lung cancer. He turns to a life of crime, producing and selling methamphetamine accompanied by a former student, Jesse Pinkman, with the aim of securing his family''s financial future before he dies.', '45', 't', '1553807287', '1553807287');
  INSERT INTO "public"."episodes" ("show_id", "name", "first_aired", "overview", "lastupdated", "episodenumber", "external_id_tvdb") VALUES ('2', 'Pilot', '2008-01-20', 'When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer, he decides to team up with a former student and create a top of the line crystal meth in a used RV, to provide for his family once he is gone.', '1520652290', '10001', '7121402'),
    ('2', 'Cat''s in the Bag...', '2008-01-27', 'Walt and Jesse attempt to tie up loose ends.', '1520652296', '10002', '7121402'),
    ('2', '...And the Bag''s in the River', '2008-02-10', 'Walter fights with Jesse over his drug use', '1520652300', '10003', '7121402'),
    ('2', 'Cancer Man', '2008-02-17', 'Walter finally tells his family that he has been stricken with cancer.', '1520652304', '10004', '7121402'),
    ('2', 'Gray Matter', '2008-02-24', 'Walter and Skyler attend a former colleague''s party.', '1520652308', '10005', '7121402'),
    ('2', 'Crazy Handful of Nothin''', '2008-03-02', 'The side effects of chemo begin to plague Walt.', '1520652311', '10006', '7121402'),
    ('2', 'A No-Rough-Stuff-Type Deal', '2008-03-09', 'Walter accepts his new identity.', '1520652316', '10007', '7121402');

  SELECT setval('shows_id_seq', 3, false);

  INSERT INTO "public"."users" ("id", "firebase_id", "name", "api_key") VALUES ('2', '2', 'tjoskar2', 'hello'), ('3', '3', 'john', 'snow');
  SELECT setval('users_id_seq', 4, false);
  `);
}
