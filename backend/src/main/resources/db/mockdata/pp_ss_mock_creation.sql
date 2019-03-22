INSERT INTO "public"."course" ("id", "course_code", "external_id", "name", "created_at", "archived_at") VALUES (DEFAULT, '84736', null, '[Mock] Programming Paradigms', '2019-03-04 21:21:28.150000', null);
INSERT INTO "public"."course" ("id", "course_code", "external_id", "name", "created_at", "archived_at") VALUES (DEFAULT, '73623', null, '[Mock] Software Systems', '2019-03-04 21:21:28.150000', null);

-- PP labels: ID 1-3
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'fp-only', '000000', 1);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'minor', 'FFFFFF', 1);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'pandora', 'FF0000', 1);

-- SS labels: 4-17
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'cs-1', 'f58231', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'cs-2', 'ffe119', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'cs-3', 'bfef45', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'cs-4', '3cb44b', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'cs-5', '42d4f4', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'cs-6', '4363d8', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'cs-7', '911eb4', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'cs-8', 'f032e6', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'cs-9', 'fabebe', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'bit-1', 'a9a9a9', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'bit-2', 'aaffc3', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'bit-3', '469990', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'bit-4', 'e6194B', 2);
INSERT INTO public.label (id, name, color, course_id) VALUES (DEFAULT, 'struggling', '000000', 2);


INSERT INTO "public"."person" ("id", "login_id", "email", "full_name", "short_name", "sortable_name", "created_at") VALUES (DEFAULT, 's1843141', 'r.h.devries@student.utwente.nl', 'Rick de Vries', 'Rick', 'Vries, Rick de','2019-02-04 21:25:29.310000');
INSERT INTO "public"."person" ("id", "login_id", "email", "full_name", "short_name", "sortable_name", "created_at") VALUES (DEFAULT, 's1782215', 'j.w.praas@student.utwente.nl', 'Justin Praas', 'Justin', 'Praas, Justin', '2019-02-04 21:25:29.310000');
INSERT INTO "public"."person" ("id", "login_id", "email", "full_name", "short_name", "sortable_name", "created_at") VALUES (DEFAULT, 's1839047', 'd.kooij-1@student.utwente.nl', 'Daan Kooij', 'Daan', 'Kooij, Daan', '2019-02-04 21:25:29.310000');
INSERT INTO "public"."person" ("id", "login_id", "email", "full_name", "short_name", "sortable_name", "created_at") VALUES (DEFAULT, 's1803697', 'r.abraham@student.utwente.nl', 'Remco Abraham', 'Remco', 'Abraham, Remco', '2019-02-04 21:25:29.310000');
INSERT INTO "public"."person" ("id", "login_id", "email", "full_name", "short_name", "sortable_name", "created_at") VALUES (DEFAULT, 's1835327', 'r.a.h.perera@student.utwente.n', 'Harindu Perera', 'Harindu', 'Perera, Harindu', '2019-02-04 21:25:29.310000');

INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 491, 1, 2, null, DEFAULT, '2019-03-01 21:27:31.824000');
INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 492, 1, 2, null, DEFAULT, '2019-03-01 21:27:31.824000');
INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 493, 1, 3, null, DEFAULT, '2019-03-01 21:27:31.824000');
INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 494, 1, 3, null, DEFAULT, '2019-03-01 21:27:31.824000');
INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 495, 1, 3, null, DEFAULT, '2019-03-01 21:27:31.824000');

INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 491, 2, 3, null, DEFAULT, '2019-03-01 21:27:31.824000');
INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 492, 2, 3, null, DEFAULT, '2019-03-01 21:27:31.824000');
INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 493, 2, 2, null, DEFAULT, '2019-03-01 21:27:31.824000');
INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 494, 2, 2, null, DEFAULT, '2019-03-01 21:27:31.824000');
INSERT INTO "public"."participant" ("id", "person_id", "course_id", "role_id", "comment_thread_id", "enabled", "created_at") VALUES (DEFAULT, 495, 2, 2, null, DEFAULT, '2019-03-01 21:27:31.824000');

INSERT INTO "public"."assignment_set" ("id", "course_id", "name", "created_by", "created_at") VALUES (DEFAULT, 1, 'CC questions', 1, '2019-03-04 21:29:22.160000');
INSERT INTO "public"."assignment_set" ("id", "course_id", "name", "created_by", "created_at") VALUES (DEFAULT, 1, 'CP questions', 1, '2019-03-04 21:30:05.027000');
INSERT INTO "public"."assignment_set" ("id", "course_id", "name", "created_by", "created_at") VALUES (DEFAULT, 1, 'FP questions', 1, '2019-03-04 21:30:25.651000');
INSERT INTO "public"."assignment_set" ("id", "course_id", "name", "created_by", "created_at") VALUES (DEFAULT, 1, 'LP questions', 1, '2019-03-04 21:30:49.779000');

INSERT INTO "public"."assignment_set" ("id", "course_id", "name", "created_by", "created_at") VALUES (DEFAULT, 2, 'Programming', 8, '2019-03-04 21:29:22.160000');
INSERT INTO "public"."assignment_set" ("id", "course_id", "name", "created_by", "created_at") VALUES (DEFAULT, 2, 'Design', 8, '2019-03-04 21:30:05.027000');

INSERT INTO "public"."group_set" ("id", "course_id", "external_id", "name", "created_by", "created_at") VALUES (DEFAULT, 1, null, 'Normal pairs', 1, '2019-03-04 21:33:04.515000');

INSERT INTO "public"."group_set" ("id", "course_id", "external_id", "name", "created_by", "created_at") VALUES (DEFAULT, 2, null, 'All courses', 8, '2019-03-04 21:33:04.515000');
INSERT INTO "public"."group_set" ("id", "course_id", "external_id", "name", "created_by", "created_at") VALUES (DEFAULT, 2, null, 'Programming-only', 8, '2019-03-04 21:33:04.515000');

INSERT INTO "public"."assignment_group_sets_mapping" ("assignment_set_id", "group_set_id") VALUES (1, 1);
INSERT INTO "public"."assignment_group_sets_mapping" ("assignment_set_id", "group_set_id") VALUES (2, 1);
INSERT INTO "public"."assignment_group_sets_mapping" ("assignment_set_id", "group_set_id") VALUES (3, 1);
INSERT INTO "public"."assignment_group_sets_mapping" ("assignment_set_id", "group_set_id") VALUES (4, 1);

INSERT INTO "public"."assignment_group_sets_mapping" ("assignment_set_id", "group_set_id") VALUES (5, 2);
INSERT INTO "public"."assignment_group_sets_mapping" ("assignment_set_id", "group_set_id") VALUES (5, 3);
INSERT INTO "public"."assignment_group_sets_mapping" ("assignment_set_id", "group_set_id") VALUES (6, 2);
