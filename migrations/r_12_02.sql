ALTER TABLE course ADD canvas_id CHAR(255) NOT NULL AFTER id;
UPDATE course SET canvas_id = RIGHT(id,6);
ALTER TABLE course DROP INDEX `PRIMARY`, ADD PRIMARY KEY (canvas_id);