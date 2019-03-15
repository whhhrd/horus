ALTER TABLE person ADD COLUMN sortable_name VARCHAR NOT NULL DEFAULT '';
UPDATE person SET sortable_name = full_name WHERE sortable_name = '';