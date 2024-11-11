-- Type: UNDO
-- Name: subscriptions_add_user_id_url_workspace_id_key
-- Description: 

BEGIN;

ALTER TABLE omnivore.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_url_workspace_id_key;
ALTER TABLE omnivore.subscriptions ADD CONSTRAINT subscriptions_user_id_url_key UNIQUE (user_id, url);

COMMIT;
