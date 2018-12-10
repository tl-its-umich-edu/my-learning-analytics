ALTER TABLE academic_terms CHANGE term_id id BIGINT UNSIGNED;
ALTER TABLE academic_terms CHANGE start_date date_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE academic_terms CHANGE end_date date_end TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE academic_terms ADD COLUMN canvas_id CHAR(255) AFTER id;

ALTER TABLE course MODIFY term_id BIGINT UNSIGNED NOT NULL DEFAULT 1;

UPDATE academic_terms SET id = 17700000000000108, canvas_id = "108" WHERE id = 1;
UPDATE course SET term_id = 17700000000000108 WHERE term_id = 1;

UPDATE academic_terms SET id = 17700000000000111, canvas_id = "111" WHERE id = 2;
UPDATE course SET term_id = 17700000000000111 WHERE term_id = 2;