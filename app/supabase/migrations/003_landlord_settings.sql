-- Rentora · Migration 003 — Landlord Settings
-- Run in Supabase SQL editor

alter table landlords
  add column if not exists whatsapp_phone_number_id  text,
  add column if not exists whatsapp_access_token      text,
  add column if not exists ecocash_merchant_number    text,
  add column if not exists ecocash_merchant_name      text,
  add column if not exists accepted_payment_methods   text[]   not null default '{"ecocash","cash"}',
  add column if not exists reminders_enabled          boolean  not null default true,
  add column if not exists reminder_days_before       int[]    not null default '{7,3,1}';
