CREATE TABLE supplementary_role(
  id BIGSERIAL NOT NULL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  course_id BIGINT NOT NULL REFERENCES course(id)
);

CREATE INDEX supplementary_role_course_idx ON supplementary_role(course_id);

CREATE TABLE supplementary_role_permission(
  supplementary_role_id BIGINT NOT NULL REFERENCES supplementary_role(id),
  permission_name VARCHAR NOT NULL REFERENCES permission(name),
  CONSTRAINT supplementary_role_permission_pkey PRIMARY KEY (supplementary_role_id, permission_name)
);

CREATE INDEX supplementary_role_permission_supplementary_role_id_idx ON supplementary_role_permission(supplementary_role_id);
CREATE INDEX supplementary_role_permission_permission_name_idx ON supplementary_role_permission(permission_name);

CREATE TABLE participant_supplementary_role_mapping(
  supplementary_role_id BIGINT NOT NULL REFERENCES supplementary_role(id),
  participant_id BIGINT NOT NULL REFERENCES participant(id),
  assigned_by BIGINT NOT NULL REFERENCES participant(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT participant_supplementary_role_mapping_unique UNIQUE (supplementary_role_id, participant_id)
);

CREATE INDEX participant_supplementary_role_mapping_supplementary_role_id_idx ON participant_supplementary_role_mapping(supplementary_role_id);
CREATE INDEX participant_supplementary_role_mapping_participant_id_idx ON participant_supplementary_role_mapping(participant_id);
CREATE INDEX participant_supplementary_role_mapping_assigned_by_idx ON participant_supplementary_role_mapping(assigned_by);


