-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to invoke the Edge Function
CREATE OR REPLACE FUNCTION trigger_daily_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Make HTTP request to Edge Function
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/daily-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) INTO request_id;
  
  RAISE NOTICE 'Daily summary triggered with request_id: %', request_id;
END;
$$;

-- Schedule the cron job to run daily at 8:00 AM UTC
SELECT cron.schedule(
  'daily-summary-email',           -- job name
  '0 8 * * *',                     -- cron expression: every day at 8:00 AM UTC
  $$SELECT trigger_daily_summary();$$  -- SQL to execute
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;