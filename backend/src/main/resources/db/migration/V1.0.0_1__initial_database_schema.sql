CREATE TABLE person (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  login_id VARCHAR NOT NULL UNIQUE,
  email VARCHAR NULL,
  full_name VARCHAR NOT NULL,
  short_name VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE course (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  course_code VARCHAR NOT NULL,
  external_id VARCHAR NULL,
  name VARCHAR NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TYPE RoleName AS ENUM ('TEACHER', 'TEACHING_ASSISTANT', 'STUDENT');

CREATE TABLE role (
  name RoleName NOT NULL PRIMARY KEY
);

CREATE TABLE permission (
  name VARCHAR NOT NULL PRIMARY KEY
);

CREATE TABLE role_permission (
  role_name RoleName NOT NULL REFERENCES role(name),
  permission_name VARCHAR NOT NULL REFERENCES permission(name),

  CONSTRAINT role_permission_pkey PRIMARY KEY (role_name, permission_name)
);

CREATE INDEX role_permission_role_idx ON role_permission(role_name);
CREATE INDEX role_permission_permission_idx ON role_permission(permission_name);

CREATE TABLE participant (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id),
  course_id BIGINT NOT NULL REFERENCES course(id),
  role_name RoleName NOT NULL REFERENCES role(name),
  comment_thread_id BIGINT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,

  CONSTRAINT participant_unique UNIQUE (person_id, course_id)
);

CREATE INDEX participant_person_idx ON participant(person_id);
CREATE INDEX participant_course_idx ON participant(course_id);
CREATE INDEX participant_role_idx ON participant(role_name);

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
  group_set_id BIGSERIAL NOT NULL REFERENCES group_set(id),
  external_id VARCHAR NULL,
  comment_thread_id BIGINT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT NOT NULL REFERENCES participant(id),
  archived_by BIGINT NULL REFERENCES participant(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NULL,

  CONSTRAINT group_group_set_external_id_unique UNIQUE (group_set_id, external_id)
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

CREATE TABLE assignment_set (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES course(id),
  name VARCHAR NOT NULL,
  created_by BIGINT NOT NULL REFERENCES participant(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX assignment_set_course_idx ON assignment_set(course_id);
CREATE INDEX assignment_set_created_by_idx ON assignment_set(created_by);

CREATE TABLE assignment (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  assignment_set_id BIGINT NOT NULL REFERENCES assignment_set(id),
  name VARCHAR NOT NULL,
  comment_thread_id BIGINT NOT NULL,
  orderKey VARCHAR NOT NULL,
  created_by BIGINT NOT NULL REFERENCES participant(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX assignment_assignment_set_idx ON assignment(assignment_set_id);
CREATE INDEX assignment_created_by_idx ON assignment(created_by);

CREATE TYPE SignOffResult AS ENUM ('COMPLETE', 'INCOMPLETE');

CREATE TABLE assignment_sign_off_result (
  participant_id BIGINT NOT NULL REFERENCES participant(id),
  assignment_id BIGINT NOT NULL REFERENCES assignment(id),
  comment_thread_id BIGINT NOT NULL,
  result SignOffResult NOT NULL,
  signer_id BIGINT NOT NULL REFERENCES participant(id),
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT assignment_sign_off_result_unique UNIQUE (participant_id, assignment_id)
);

CREATE INDEX assignment_sign_off_result_assignment_idx ON assignment_sign_off_result(assignment_id);
CREATE INDEX assignment_sign_off_result_participant_idx ON assignment_sign_off_result(participant_id);
CREATE INDEX assignment_sign_off_result_signer_idx ON assignment_sign_off_result(signer_id);

CREATE TYPE CommentType AS ENUM ('REMARK', 'FEEDBACK');

CREATE TABLE comment (
  id BIGSERIAL NOT NULL,
  person_id BIGINT NOT NULL REFERENCES person(id),
  thread_id BIGINT NOT NULL,
  "type" CommentType NOT NULL,
  content VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_edited_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX comment_person_idx ON comment(person_id);
CREATE INDEX comment_thread_idx ON comment(thread_id);

CREATE SEQUENCE comment_thread_id_seq;