CREATE TABLE IF NOT EXISTS usernames (
  username TEXT PRIMARY KEY CHECK(length(username) BETWEEN 3 AND 20 AND username = lower(username) AND username NOT GLOB '*[^a-z0-9_]*'),
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL CHECK(lower(display_name) = username),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS deleted_accounts (
  uid TEXT PRIMARY KEY
);
