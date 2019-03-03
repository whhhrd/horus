CREATE TABLE auth_code (
  code VARCHAR NOT NULL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX auth_code_person_idx ON auth_code(person_id);