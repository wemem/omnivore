-- Type: DO
-- Name: add_common_user
-- Description: 
BEGIN;
INSERT INTO omnivore.user (
        id,
        email,
        name,
        source,
        source_user_id,
        created_at,
        updated_at
    )
VALUES (
        '00000000-0000-0000-0000-000000000000',
        'common-user@wemem.internal',
        'Common User',
        'EMAIL',
        '00000000-0000-0000-0000-000000000000',
        NOW(),
        NOW()
    );
COMMIT;