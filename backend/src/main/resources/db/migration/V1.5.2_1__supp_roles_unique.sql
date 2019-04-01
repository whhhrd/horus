-- Remove invalid constraint and fix with proper course-unique
-- Also add proper index on PK
ALTER TABLE supplementary_role DROP CONSTRAINT supplementary_role_name_key;
ALTER TABLE supplementary_role ADD CONSTRAINT supplementary_role_name_course_id_unique UNIQUE (name, course_id);

CREATE INDEX supplementary_role_id_idx ON supplementary_role(id);

