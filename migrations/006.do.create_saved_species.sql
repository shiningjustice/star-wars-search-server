DROP TABLE IF EXISTS saved_species;

CREATE TABLE saved_species (
  id INTEGER NOT NULL, 
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE NOT NULL,
  favorited BOOLEAN DEFAULT false,
  notes TEXT
);
