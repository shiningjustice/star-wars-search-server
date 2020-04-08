BEGIN;

TRUNCATE
  "saved_people",
  "saved_films",
  "saved_starships",
  "saved_vehicles",
  "saved_species",
  "saved_planets",
  "user";

INSERT INTO "user" ("id", "username", "password", "first_name", "side")
VALUES
  (
    1,
    'admin',
    -- password = "P@ssw0rd", salted by 12
    '$2a$12$97iynXdhkTqyWYjlISIIbevz0gPEq0QX7RstxZji87kMN.bdn01l2',
    'Admin',
    'light'
  );

INSERT INTO "saved_people" ("id", "user_id", "favorited", "notes")
VALUES 
  (
    2,
    1, 
    true, 
    'test notes'
  ), 
  (
    3, 
    1, 
    true,
    ''
  ), 
  (
    4, 
    1, 
    false,
    'another test note'
  );

INSERT INTO "saved_films" ("id", "user_id", "favorited", "notes")
VALUES 
  (
    2,
    1, 
    true, 
    'test notes'
  ), 
  (
    3, 
    1, 
    true,
    ''
  ), 
  (
    4, 
    1, 
    false,
    'another test note'
  );

INSERT INTO "saved_starships" ("id", "user_id", "favorited", "notes")
VALUES
  (
    5,
    1, 
    true, 
    'test notes'
  ), 
  (
    9, 
    1, 
    true,
    ''
  ), 
  (
    10, 
    1, 
    false,
    'another test note'
  );

INSERT INTO "saved_vehicles" ("id", "user_id", "favorited", "notes")
VALUES
  (
    4,
    1, 
    true, 
    'test notes'
  ), 
  (
    6, 
    1, 
    true,
    ''
  ), 
  (
    7, 
    1, 
    false,
    'another test note'
  );

INSERT INTO "saved_species" ("id", "user_id", "favorited", "notes")
VALUES
  (
    5,
    1, 
    true, 
    'test notes'
  ), 
  (
    9, 
    1, 
    true,
    ''
  ), 
  (
    10, 
    1, 
    false,
    'another test note'
  );

INSERT INTO "saved_planets" ("id", "user_id", "favorited", "notes")
VALUES
  (
    2,
    1, 
    true, 
    'test notes'
  ),
  (
    3, 
    1, 
    true,
    ''
  ),
  (
    4, 
    1, 
    false,
    'another test note'
  );

COMMIT;