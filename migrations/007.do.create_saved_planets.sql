DROP TABLE IF EXISTS saved_planets;

CREATE TABLE saved_planets (
  id INTEGER NOT NULL, 
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE NOT NULL,
  favorited BOOLEAN DEFAULT false,
  notes TEXT
);