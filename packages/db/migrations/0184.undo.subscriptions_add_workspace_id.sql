-- Type: UNDO
-- Name: subscriptions_add_workspace_id
-- Description: 

BEGIN;

-- Remove the index on workspace_id
DROP INDEX IF EXISTS omnivore.idx_subscriptions_workspace_id;

-- Remove workspace_id column from subscriptions table
ALTER TABLE omnivore.subscriptions
DROP COLUMN IF EXISTS workspace_id;

COMMIT;
