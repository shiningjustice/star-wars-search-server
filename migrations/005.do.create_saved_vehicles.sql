DROP TABLE IF EXISTS saved_vehicles;

CREATE TABLE saved_vehicles (
  id INTEGER NOT NULL, 
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE NOT NULL,
  favorited BOOLEAN DEFAULT false,
  notes TEXT
);
