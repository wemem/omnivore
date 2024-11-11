-- Type: UNDO
-- Name: add_common_user
-- Description: 

BEGIN;

DELETE FROM omnivore.user WHERE id = '00000000-0000-0000-0000-000000000000';

COMMIT;
