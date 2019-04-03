CREATE TABLE refresh_token (
  id VARCHAR NOT NULL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id),
  client_id VARCHAR,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX refresh_token_person_id_idx ON refresh_token(person_id);
CREATE INDEX refresh_token_client_id_idx ON refresh_token(client_id);
CREATE INDEX refresh_token_expires_at_idx ON refresh_token(expires_at);
CREATE INDEX refresh_token_last_used_at_idx ON refresh_token(last_used_at);
