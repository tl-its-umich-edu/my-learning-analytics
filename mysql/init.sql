drop database student_dashboard;
create database student_dashboard CHARACTER SET utf8;
grant all on student_dashboard.* to student_dashboard_user@'localhost' identified by 'student_dashboard_password';
grant all on student_dashboard.* to student_dashboard_user@'127.0.0.1' identified by 'student_dashboard_password';
flush privileges;

use student_dashboard;

CREATE TABLE IF NOT EXISTS academic_terms (
  id         BIGINT UNSIGNED NOT NULL,
  canvas_id  CHAR(255) NOT NULL,
  name       CHAR(255)    NOT NULL DEFAULT '',
  date_start TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  date_end   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (id)
);

CREATE TABLE IF NOT EXISTS course (
  id      CHAR(255)      NOT NULL,
  canvas_id CHAR(255)    NOT NULL,
  term_id BIGINT UNSIGNED    NOT NULL DEFAULT 1,
  name    CHAR(255)      NOT NULL DEFAULT '',
  PRIMARY KEY (canvas_id)
);

CREATE TABLE IF NOT EXISTS file_access (
  file_id      CHAR(255)      NOT NULL,
  user_id      CHAR(255)      NOT NULL DEFAULT '',
  access_time  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS file (
  id      CHAR(255)      NOT NULL,
  name      TEXT   NOT NULL,
  course_id    CHAR(255)      NOT NULL,
  PRIMARY KEY  (id)
);

CREATE TABLE IF NOT EXISTS user (
  id      CHAR(255)      NOT NULL,
  name      CHAR(255)    NOT NULL DEFAULT '',
  sis_id  CHAR(255),
  sis_name  CHAR(255),
  course_id CHAR(255),
  current_grade    CHAR(255),
  final_grade    CHAR(255),
  PRIMARY KEY  (id,course_id)
);

CREATE TABLE IF NOT EXISTS assignment_groups(
   id         CHAR(255)    NOT NULL,
   name       CHAR(255)    NOT NULL DEFAULT '',
   weight     CHAR(255),
   group_points     CHAR(255),
   course_id  CHAR(255)    NOT NULL,
   drop_lowest CHAR(255),
   drop_highest CHAR(255),
   PRIMARY KEY  (id)
);

CREATE TABLE IF NOT EXISTS assignment(
  id  CHAR(255)    NOT NULL,
  name CHAR(255)    NOT NULL DEFAULT '',
  due_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  local_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  points_possible CHAR(255),
  course_id  CHAR(255)    NOT NULL,
  assignment_group_id CHAR(255) NOT NULL,
  PRIMARY KEY  (id)
);

CREATE TABLE IF NOT EXISTS submission(
 id  CHAR(255)    NOT NULL,
 assignment_id  CHAR(255)    NOT NULL,
 course_id CHAR(255) NOT NULL,
 user_id  CHAR(255)    NOT NULL,
 score CHAR(255),
 graded_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
 avg_score FLOAT,
 PRIMARY KEY  (id)
);

CREATE TABLE IF NOT EXISTS assignment_weight_consideration(
course_id CHAR(255) NOT NULL,
consider_weight BOOLEAN DEFAULT FALSE,
PRIMARY KEY (course_id)
);

CREATE TABLE IF NOT EXISTS course_view_option (
    course_id CHAR(255) PRIMARY KEY,
    show_files_accessed BOOLEAN DEFAULT TRUE,
    show_assignment_planning BOOLEAN DEFAULT TRUE,
    show_grade_distribution BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS unizin_metadata (
    pkey VARCHAR(20) PRIMARY KEY,
    pvalue VARCHAR(100)
);


-- insert terms
INSERT INTO academic_terms (id, canvas_id, name, date_start, date_end) VALUES (17700000000000108, 108, 'SUMMER 2018', '2018-06-27 04:00:00',  '2018-08-17 23:59:59' );
INSERT INTO academic_terms (id, canvas_id, name, date_start, date_end) VALUES (17700000000000111, 111, 'FALL 2018', '2018-09-03 04:00:00',  '2018-12-24 23:59:59' );
-- insert course
INSERT INTO course (canvas_id, id, name, term_id) VALUES ('230745', '17700000000230745', 'STATS 250 SU 2018', 17700000000000108);
INSERT INTO course (canvas_id, id, name, term_id) VALUES ('252307', '17700000000252307', 'SI 110 001 FA 2018', 17700000000000111);
INSERT INTO course (canvas_id, id, name, term_id) VALUES ('245664', '17700000000245664', 'SI 664 002 FA 2018', 17700000000000111);
INSERT INTO course (canvas_id, id, name, term_id) VALUES ('283292', '17700000000283292', 'HMP 654 001 FA 2018', 17700000000000111);
-- insert course view options
INSERT INTO course_view_option (course_id, show_files_accessed, show_assignment_planning, show_grade_distribution) VALUES ('17700000000230745', TRUE, TRUE, FALSE);
INSERT INTO course_view_option (course_id, show_files_accessed, show_assignment_planning, show_grade_distribution) VALUES ('17700000000245664', TRUE, TRUE, TRUE);
INSERT INTO course_view_option (course_id, show_files_accessed, show_assignment_planning, show_grade_distribution) VALUES ('17700000000283292', TRUE, TRUE, TRUE);

COMMIT;