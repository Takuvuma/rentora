-- ─────────────────────────────────────────────
-- Rentora · Initial Schema
-- Run this in your Supabase SQL editor
-- ─────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────── ENUMS ───────────────
create type payment_status as enum ('paid', 'due', 'late', 'partial', 'waived');
create type maintenance_priority as enum ('low', 'medium', 'urgent', 'emergency');
create type maintenance_status as enum ('open', 'assigned', 'in_progress', 'resolved', 'closed');
create type subscription_tier as enum ('starter', 'growth', 'pro', 'enterprise');
create type payment_method as enum ('ecocash', 'payfast', 'card', 'cash', 'bank_transfer');
create type message_role as enum ('user', 'assistant');
create type conversation_channel as enum ('whatsapp', 'web');
create type reminder_channel as enum ('whatsapp', 'email');
create type currency_code as enum ('USD', 'ZAR');
create type country_code as enum ('ZW', 'ZA', 'NG', 'KE', 'GH');

-- ─────────────── LANDLORDS ───────────────
create table landlords (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  country country_code not null default 'ZW',
  subscription_tier subscription_tier not null default 'starter',
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- ─────────────── PROPERTIES ───────────────
create table properties (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid not null references landlords(id) on delete cascade,
  name text not null,
  address text not null,
  city text not null,
  country country_code not null default 'ZW',
  total_units int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────── UNITS ───────────────
create table units (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id) on delete cascade,
  unit_number text not null,
  rent_amount numeric(10,2) not null,
  currency currency_code not null default 'USD',
  rent_due_day int not null default 1 check (rent_due_day between 1 and 28),
  is_occupied boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, unit_number)
);

-- ─────────────── TENANTS ───────────────
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  landlord_id uuid not null references landlords(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  whatsapp_id text,
  invite_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  invite_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────── LEASES ───────────────
create table leases (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  start_date date not null,
  end_date date,
  monthly_rent numeric(10,2) not null,
  currency currency_code not null default 'USD',
  deposit_amount numeric(10,2) not null default 0,
  document_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────── PAYMENTS ───────────────
create table payments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  landlord_id uuid not null references landlords(id) on delete cascade,
  amount numeric(10,2) not null,
  currency currency_code not null default 'USD',
  period_month int not null check (period_month between 1 and 12),
  period_year int not null,
  status payment_status not null default 'due',
  method payment_method,
  transaction_ref text,
  paid_at timestamptz,
  due_date date not null,
  rentora_fee numeric(10,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, period_month, period_year)
);

-- ─────────────── MAINTENANCE REQUESTS ───────────────
create table maintenance_requests (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  landlord_id uuid not null references landlords(id) on delete cascade,
  title text not null,
  description text not null,
  priority maintenance_priority not null default 'medium',
  status maintenance_status not null default 'open',
  photo_urls text[] not null default '{}',
  contractor_name text,
  contractor_phone text,
  assigned_at timestamptz,
  resolved_at timestamptz,
  ai_triage_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────── AI CONVERSATIONS ───────────────
create table ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  landlord_id uuid not null references landlords(id) on delete cascade,
  channel conversation_channel not null default 'web',
  is_escalated boolean not null default false,
  escalated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────── AI MESSAGES ───────────────
create table ai_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role message_role not null,
  content text not null,
  tool_calls jsonb,
  created_at timestamptz not null default now()
);

-- ─────────────── RENT REMINDERS ───────────────
create table rent_reminders (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references payments(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  days_before int not null,
  sent_at timestamptz not null default now(),
  channel reminder_channel not null default 'whatsapp',
  created_at timestamptz not null default now()
);

-- ─────────────── UPDATED_AT TRIGGER ───────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger landlords_updated_at before update on landlords for each row execute function update_updated_at();
create trigger properties_updated_at before update on properties for each row execute function update_updated_at();
create trigger units_updated_at before update on units for each row execute function update_updated_at();
create trigger tenants_updated_at before update on tenants for each row execute function update_updated_at();
create trigger leases_updated_at before update on leases for each row execute function update_updated_at();
create trigger payments_updated_at before update on payments for each row execute function update_updated_at();
create trigger maintenance_requests_updated_at before update on maintenance_requests for each row execute function update_updated_at();
create trigger ai_conversations_updated_at before update on ai_conversations for each row execute function update_updated_at();

-- ─────────────── ROW LEVEL SECURITY ───────────────
alter table landlords enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table payments enable row level security;
alter table maintenance_requests enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table rent_reminders enable row level security;

-- Landlords: own row only
create policy "landlords_own" on landlords for all using (user_id = auth.uid());

-- Properties: landlord owns their properties
create policy "properties_landlord" on properties for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

-- Units: landlord owns via property
create policy "units_landlord" on units for all
  using (property_id in (
    select p.id from properties p
    join landlords l on l.id = p.landlord_id
    where l.user_id = auth.uid()
  ));

-- Tenants: landlord sees their tenants
create policy "tenants_landlord" on tenants for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

-- Tenants: tenant sees own row
create policy "tenants_own" on tenants for select
  using (user_id = auth.uid());

-- Leases: landlord
create policy "leases_landlord" on leases for all
  using (tenant_id in (
    select t.id from tenants t
    join landlords l on l.id = t.landlord_id
    where l.user_id = auth.uid()
  ));

-- Leases: tenant sees own
create policy "leases_tenant" on leases for select
  using (tenant_id in (select id from tenants where user_id = auth.uid()));

-- Payments: landlord
create policy "payments_landlord" on payments for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

-- Payments: tenant sees own
create policy "payments_tenant" on payments for select
  using (tenant_id in (select id from tenants where user_id = auth.uid()));

-- Maintenance: landlord
create policy "maintenance_landlord" on maintenance_requests for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

-- Maintenance: tenant sees own, can insert
create policy "maintenance_tenant_select" on maintenance_requests for select
  using (tenant_id in (select id from tenants where user_id = auth.uid()));
create policy "maintenance_tenant_insert" on maintenance_requests for insert
  with check (tenant_id in (select id from tenants where user_id = auth.uid()));

-- AI conversations + messages: landlord sees all, tenant sees own
create policy "ai_conv_landlord" on ai_conversations for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));
create policy "ai_conv_tenant" on ai_conversations for all
  using (tenant_id in (select id from tenants where user_id = auth.uid()));

create policy "ai_msg_landlord" on ai_messages for select
  using (conversation_id in (
    select c.id from ai_conversations c
    join landlords l on l.id = c.landlord_id
    where l.user_id = auth.uid()
  ));
create policy "ai_msg_tenant" on ai_messages for all
  using (conversation_id in (
    select c.id from ai_conversations c
    join tenants t on t.id = c.tenant_id
    where t.user_id = auth.uid()
  ));

-- ─────────────── INDEXES ───────────────
create index payments_landlord_status on payments(landlord_id, status);
create index payments_due_date on payments(due_date);
create index maintenance_landlord_status on maintenance_requests(landlord_id, status);
create index tenants_phone on tenants(phone);
create index tenants_whatsapp on tenants(whatsapp_id);
create index ai_messages_conversation on ai_messages(conversation_id, created_at);
