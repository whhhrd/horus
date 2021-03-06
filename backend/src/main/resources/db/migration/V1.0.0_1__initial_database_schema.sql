CREATE TABLE person (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  login_id VARCHAR NOT NULL UNIQUE,
  email VARCHAR NULL,
  full_name VARCHAR NOT NULL,
  short_name VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

------ Comment-related commands -----------------------------

CREATE TABLE comment_thread (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  "type" VARCHAR NOT NULL,
  CHECK ( "type" IN ('STAFF_ONLY', 'PUBLIC') )
);


CREATE TABLE comment (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id),
  thread_id BIGINT NOT NULL REFERENCES comment_thread(id) ON DELETE CASCADE,
  content VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_edited_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX comment_person_idx ON comment(person_id);
CREATE INDEX comment_thread_idx ON comment(thread_id);

------ Course-related commands ------------

CREATE TABLE course (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  course_code VARCHAR NULL,
  external_id VARCHAR NULL UNIQUE,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NULL
);

------ Auth-related commands ------------

CREATE TABLE role (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE permission (
  name VARCHAR NOT NULL PRIMARY KEY
);

CREATE TABLE role_permission (
  role_id BIGINT NOT NULL REFERENCES role(id),
  permission_name VARCHAR NOT NULL REFERENCES permission(name),

  CONSTRAINT role_permission_pkey PRIMARY KEY (role_id, permission_name)
);

CREATE INDEX role_permission_role_idx ON role_permission(role_id);
CREATE INDEX role_permission_permission_idx ON role_permission(permission_name);

------ Course participation commands ------------

CREATE TABLE participant (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id),
  course_id BIGINT NOT NULL REFERENCES course(id),
  role_id BIGINT NOT NULL REFERENCES role(id),
  comment_thread_id BIGINT NULL REFERENCES comment_thread(id) ON DELETE SET NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,

  CONSTRAINT participant_unique UNIQUE (person_id, course_id)
);

CREATE INDEX participant_person_idx ON participant(person_id);
CREATE INDEX participant_course_idx ON participant(course_id);
CREATE INDEX participant_role_idx ON participant(role_id);

------ Group-related commands ------------

CREATE TABLE group_set (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES course(id),
  external_id VARCHAR NULL,
  name VARCHAR NOT NULL,
  created_by BIGINT NOT NULL REFERENCES participant(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,

  CONSTRAINT group_set_course_external_id_unique UNIQUE (course_id, external_id)
);

CREATE INDEX group_set_course_idx ON group_set(course_id);

CREATE TABLE "group" (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  name VARCHAR NOT NULL,
  group_set_id BIGSERIAL NOT NULL REFERENCES group_set(id),
  external_id VARCHAR NULL,
  comment_thread_id BIGINT NULL REFERENCES comment_thread(id) ON DELETE SET NULL,
  created_by BIGINT NOT NULL REFERENCES participant(id),
  archived_by BIGINT NULL REFERENCES participant(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX group_group_set_idx ON "group"(group_set_id);
CREATE INDEX group_created_by_idx ON "group"(created_by);
CREATE INDEX group_archived_by_idx ON "group"(archived_by);

CREATE TABLE group_member (
  group_id BIGINT NOT NULL REFERENCES "group"(id),
  participant_id BIGINT NOT NULL REFERENCES participant(id),
  CONSTRAINT group_member_unique UNIQUE (group_id, participant_id)
);

CREATE INDEX group_member_group_idx ON group_member(group_id);
CREATE INDEX group_member_participant_idx ON group_member(participant_id);

------ Assignment and sign-off related commands ------------

CREATE TABLE assignment_set (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES course(id),
  name VARCHAR NOT NULL,
  created_by BIGINT NOT NULL REFERENCES participant(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX assignment_set_course_idx ON assignment_set(course_id);
CREATE INDEX assignment_set_created_by_idx ON assignment_set(created_by);

CREATE TABLE assignment_group_sets_mapping (
  assignment_set_id BIGINT NOT NULL REFERENCES assignment_set(id),
  group_set_id BIGINT NOT NULL REFERENCES group_set(id),
  CONSTRAINT assignment_group_sets_mapping_unique UNIQUE (assignment_set_id, group_set_id)
);

CREATE INDEX assignment_group_sets_mapping_assignment_idx ON assignment_group_sets_mapping(assignment_set_id);
CREATE INDEX assignment_group_sets_mapping_group_idx ON assignment_group_sets_mapping(group_set_id);

CREATE TABLE assignment (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  assignment_set_id BIGINT NOT NULL REFERENCES assignment_set(id),
  name VARCHAR NOT NULL,
  comment_thread_id BIGINT NULL REFERENCES comment_thread(id) ON DELETE SET NULL ,
  order_key BIGINT NOT NULL,
  created_by BIGINT NOT NULL REFERENCES participant(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX assignment_assignment_set_idx ON assignment(assignment_set_id);
CREATE INDEX assignment_created_by_idx ON assignment(created_by);

CREATE TABLE sign_off_result (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  participant_id BIGINT NOT NULL REFERENCES participant(id),
  assignment_id BIGINT NOT NULL REFERENCES assignment(id),
  comment_thread_id BIGINT NULL REFERENCES comment_thread(id) ON DELETE SET NULL,
  result VARCHAR NOT NULL,
  signed_by BIGINT NOT NULL REFERENCES participant(id),
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NULL,
  archived_by BIGINT NULL REFERENCES participant(id),
  CHECK ((archived_at IS NULL AND archived_by IS NULL) OR (archived_at IS NOT NULL AND archived_by IS NOT NULL)),
  CHECK ( result IN ('COMPLETE', 'INSUFFICIENT') )
);

CREATE OR REPLACE FUNCTION check_one_active() RETURNS TRIGGER AS  $$
    BEGIN
        IF (SELECT COUNT(*) FROM sign_off_result AS r WHERE r.participant_id = NEW.participant_id AND r.assignment_id = NEW.assignment_id AND archived_by IS NULL) > 1 THEN
            RAISE EXCEPTION 'Multiple unarchived sign-off results.';
        END IF;
        RETURN NULL;
    END;
  $$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER sign_off_check
AFTER INSERT OR UPDATE ON sign_off_result DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE PROCEDURE check_one_active();

CREATE INDEX sign_off_result_assignment_idx ON sign_off_result(assignment_id);
CREATE INDEX sign_off_result_participant_idx ON sign_off_result(participant_id);
CREATE INDEX sign_off_result_signed_by_idx ON sign_off_result(signed_by);
CREATE INDEX sign_off_result_archived_by_idx ON sign_off_result(archived_by);
CREATE INDEX sign_off_result_archived_at_idx ON sign_off_result(archived_at);




---- Canvas-related tables -----
CREATE TABLE canvas_token(
  id BIGSERIAL NOT NULL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id) UNIQUE,
  token VARCHAR NOT NULL
);

CREATE TABLE token_source(
  id BIGSERIAL NOT NULL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES course(id) UNIQUE,
  canvas_token_id BIGINT NOT NULL REFERENCES canvas_token(id)
);
