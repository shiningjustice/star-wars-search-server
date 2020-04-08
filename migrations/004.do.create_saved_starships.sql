DROP TABLE IF EXISTS saved_starships;

CREATE TABLE saved_starships (
  id INTEGER NOT NULL, 
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE NOT NULL,
  favorited BOOLEAN DEFAULT false,
  notes TEXT
);
