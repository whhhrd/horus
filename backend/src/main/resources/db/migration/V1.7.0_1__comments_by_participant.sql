ALTER TABLE comment ADD COLUMN author BIGINT NULL;

UPDATE comment SET author = participant.id
FROM (SELECT c2.id AS comment, course.id AS course FROM Course course, Comment c2 WHERE course.id IN (SELECT c.id FROM Course c INNER JOIN assignment_set aset ON aset.course_id = c.id INNER JOIN assignment a ON a.assignment_set_id = aset.id AND a.comment_thread_id = c2.thread_id)
                                                                                     OR course.id IN (SELECT c.id FROM Course c INNER JOIN group_set gs ON c.id = gs.course_id INNER JOIN "group" g on gs.id = g.group_set_id AND g.comment_thread_id = c2.thread_id)
                                                                                     OR course.id IN (SELECT c.id FROM Course c INNER JOIN participant p on c.id = p.course_id AND p.comment_thread_id = c2.thread_id)
                                                                                     OR course.id IN (SELECT c.id FROM Course c INNER JOIN assignment_set "as" on c.id = "as".course_id INNER JOIN assignment a2 on "as".id = a2.assignment_set_id INNER JOIN sign_off_result sor on a2.id = sor.assignment_id AND sor.comment_thread_id = c2.thread_id)
     ) AS comment_course, participant
WHERE comment.id = comment_course.comment AND participant.course_id = comment_course.course AND participant.person_id = comment.person_id;

ALTER TABLE comment ALTER COLUMN author SET NOT NULL;
ALTER TABLE comment ADD CONSTRAINT comment_author_fkey FOREIGN KEY (author) REFERENCES participant(id);
CREATE INDEX comment_author_idx ON comment(author);
ALTER TABLE comment DROP COLUMN person_id;


ALTER TABLE comment_thread ADD COLUMN author BIGINT NULL;

UPDATE comment_thread
SET author = thread_first.first
FROM (
       SELECT DISTINCT ON (t.id) t.id AS thread, c.author AS first FROM comment_thread t INNER JOIN comment c on t.id = c.thread_id ORDER BY t.id, c.created_at
     ) AS thread_first WHERE comment_thread.id = thread_first.thread;

ALTER TABLE comment_thread ALTER COLUMN author SET NOT NULL;
ALTER TABLE comment_thread ADD CONSTRAINT comment_thread_author_fkey FOREIGN KEY (author) REFERENCES participant(id);
CREATE INDEX comment_thread_author_idx ON comment_thread(author);

