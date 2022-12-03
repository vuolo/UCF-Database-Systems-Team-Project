-- CREATE NEW SURVEY
INSERT INTO surveys (title, description, authorId)
VALUES ('example title', 'description here', 'author id');

-- SELECT ALL SURVEYS
SELECT id, title, published, start_date, end_date, created_date
FROM surveys
WHERE authorId='user_id here';

-- SELECT 1 SURVEY BY ID
SELECT id, title, published, start_date, end_date, created_date
FROM surveys
WHERE id='123';

-- UPDATE SURVEY INFORMATION
UPDATE surveys
SET title = 'new title', description = 'new_description'
WHERE id='123';

-- DELETE SURVEY
DELETE
FROM surveys
WHERE id='123';





-- SELECT WHETHER USER'S EMAIL IS VERIFIED
SELECT emailVerified
FROM users
WHERE email = 'example@gmail.com';

-- UPDATE USER'S NAME
UPDATE users
SET name = 'new name'
WHERE id='123';

-- SELECT ENTIRE USER
SELECT *
FROM users
WHERE id = '123';





-- CREATE NEW SURVEY QUESTION
INSERT INTO survey_questions (id, survey_id, question_prompt, question_type)
VALUES ('123', 'survey_id here', 'Example Question', 2);

-- DISPLAY ALL QUESTIONS FOR A SPECIFIC SURVEY
SELECT *
FROM survey_questions
WHERE survey_id='123';

-- GET USER IDS OF ALL PARTICIPANTS OF A SPECIFIC SURVEY
SELECT DISTINCT user_id
FROM survey_responses
WHERE survey_id='123';

-- DELETE A QUESTION FROM A SPECIFIC SURVEY
DELETE
FROM survey_questions
WHERE id='123';





-- INSERT RESPONSES (for type-1)
INSERT INTO survey_responses (response_type_1, response_type_2, question_id)
VALUES (3, NULL, 'question id');

-- INSERT RESPONSES (for type-2)
INSERT INTO survey_responses (response_type_1, response_type_2, question_id)
VALUES (NULL, 'Survey response here', 'question id');

-- GET RESPONSE FOR QUESTION
SELECT *
FROM survey_questions
WHERE question_id='12345';