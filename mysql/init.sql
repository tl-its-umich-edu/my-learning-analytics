drop database student_dashboard;

create database student_dashboard default character set utf8;
grant all on student_dashboard.* to student_dashboard_user@'localhost' identified by 'student_dashboard_password';
grant all on student_dashboard.* to student_dashboard_user@'127.0.0.1' identified by 'student_dashboard_password';
flush privileges;

use student_dashboard;

CREATE TABLE IF NOT EXISTS ACADEMIC_TERMS (
  TERM_ID    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  NAME       CHAR(255)    NOT NULL DEFAULT '',
  START_DATE TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  END_DATE   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (TERM_ID)
);

CREATE TABLE IF NOT EXISTS FILE_ACCESS (
  FILE_ID      CHAR(255)      NOT NULL,
  USER_ID      CHAR(255)      NOT NULL DEFAULT '',
  ACCESS_TIME  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  COURSE_ID    CHAR(255)      NOT NULL,
  PRIMARY KEY  (FILE_ID, USER_ID, ACCESS_TIME)
);

-- insert terms
INSERT INTO ACADEMIC_TERMS (NAME, START_DATE, END_DATE) VALUES ('SUMMER 2018', '2018-06-27 04:00:00',  '2018-08-17 23:59:59' );

-- insert file access item
INSERT INTO FILE_ACCESS (FILE_ID, USER_ID, ACCESS_TIME,COURSE_ID) VALUES ('2000', 'USER_22', '2018-07-01 08:00:00',  'COURSE_1');

COMMIT;