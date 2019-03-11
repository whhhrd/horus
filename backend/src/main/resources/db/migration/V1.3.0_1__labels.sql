CREATE TABLE label (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  name VARCHAR NOT NULL,
  color VARCHAR(6) NOT NULL,
  course_id BIGINT NOT NULL REFERENCES course(id),
  CONSTRAINT label_name_course_unique UNIQUE (name, course_id)
);

CREATE INDEX label_course_idx ON label(course_id);
CREATE INDEX label_name_trgm_idx ON label USING gin (name gin_trgm_ops);

CREATE TABLE participant_label_mapping(
  label_id BIGINT NOT NULL REFERENCES label(id),
  participant_id BIGINT NOT NULL REFERENCES participant(id),
  assigned_by BIGINT NOT NULL REFERENCES participant(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT participant_label_mapping_unique UNIQUE (label_id, participant_id)
);

CREATE INDEX participant_label_mapping_participant_idx ON participant_label_mapping(participant_id);
CREATE INDEX participant_label_mapping_label_idx ON participant_label_mapping(label_id);

INSERT INTO permission(name) VALUES
('COURSE_LABEL/ANY/LIST'),
('COURSE_LABEL/ANY/VIEW'),
('COURSE_LABEL/ANY/CREATE'),
('COURSE_LABEL/ANY/EDIT'),
('COURSE_LABEL/ANY/DELETE'),

('COURSE_PARTICIPANT_LABEL_MAPPING/ANY/LIST'),
('COURSE_PARTICIPANT_LABEL_MAPPING/ANY/VIEW'),
('COURSE_PARTICIPANT_LABEL_MAPPING/ANY/CREATE'),
('COURSE_PARTICIPANT_LABEL_MAPPING/ANY/DELETE');