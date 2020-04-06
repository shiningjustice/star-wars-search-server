DROP TABLE IF EXISTS saved_people;

CREATE TABLE saved_people (
  id INTEGER NOT NULL, 
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE NOT NULL,
  bookmarked BOOLEAN DEFAULT false,
  notes TEXT
);
