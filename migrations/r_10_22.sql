alter table user drop index `PRIMARY`, add PRIMARY KEY (id, course_id);
alter table submission add course_id char(225) NOT NULL AFTER assignment_id;
alter table submission drop local_graded_date;