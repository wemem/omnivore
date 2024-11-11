-- Type: DO
-- Name: subscriptions_add_workspace_id
-- Description: 

BEGIN;
-- Add workspace_id column to subscriptions table
ALTER TABLE omnivore.subscriptions
ADD COLUMN workspace_id TEXT;

-- Create index on workspace_id for better query performance
CREATE INDEX idx_subscriptions_workspace_id ON omnivore.subscriptions(workspace_id);

COMMIT;
