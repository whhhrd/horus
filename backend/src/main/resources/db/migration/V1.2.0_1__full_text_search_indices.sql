CREATE INDEX person_full_name_trgm_idx ON person USING gin (LOWER(full_name) gin_trgm_ops);

CREATE INDEX person_login_id_trgm_idx ON person USING gin (LOWER(login_id) gin_trgm_ops);

CREATE INDEX group_name_trgm_idx ON "group" USING gin (LOWER(name) gin_trgm_ops);