create table if not exists weekly_peptide_schedule (
  id bigserial primary key,
  entry_id text unique not null,
  person_name text not null check (person_name in ('Sean', 'Vanessa')),
  customer_name text not null default '',
  day_of_week text not null check (
    day_of_week in (
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    )
  ),
  time_of_day text not null check (time_of_day in ('AM', 'PM')),
  schedule_date text not null,
  peptide_name text not null check (
    peptide_name in (
      'Tirzepatide',
      'NAD+',
      'GLOW',
      'Sermorelin',
      'Glutathione',
      'Testosterone',
      'BPC-157'
    )
  ),
  dose_amount numeric(12, 4) not null check (dose_amount > 0),
  dose_unit text not null check (dose_unit in ('mg', 'mcg')),
  notes text not null default '',
  source text not null default 'web_form',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table weekly_peptide_schedule
  add column if not exists customer_name text not null default '';

create index if not exists weekly_peptide_schedule_customer_idx
  on weekly_peptide_schedule (customer_name);

create index if not exists weekly_peptide_schedule_person_idx
  on weekly_peptide_schedule (person_name);

create index if not exists weekly_peptide_schedule_day_idx
  on weekly_peptide_schedule (day_of_week);

create index if not exists weekly_peptide_schedule_peptide_idx
  on weekly_peptide_schedule (peptide_name);

create index if not exists weekly_peptide_schedule_date_idx
  on weekly_peptide_schedule (schedule_date);

create index if not exists weekly_peptide_schedule_created_idx
  on weekly_peptide_schedule (created_at desc);


create table if not exists peptide_log_entries (
  id bigserial primary key,
  log_id text unique not null,
  client_name text not null default 'Sean' check (client_name in ('Sean', 'Vanessa')),
  peptide_name text not null,
  peptide_name_other text not null default '',
  sequence text not null check (sequence ~ '^[A-Z]+$'),
  batch_lot text not null default '',
  vendor_source text not null default '',
  vendor_source_other text not null default '',
  administration_date date not null check (administration_date <= current_date),
  dosage_amount numeric(12, 4) not null check (dosage_amount > 0),
  dosage_unit text not null check (dosage_unit in ('mcg', 'mg')),
  route text not null default '',
  route_other text not null default '',
  cycle_phase text not null default '',
  side_effects text not null default '',
  notes_observations text not null default '',
  rating integer not null default 0 check (rating between 0 and 10),
  attachment_name text not null default '',
  attachment_type text not null default '',
  attachment_size integer check (attachment_size is null or attachment_size <= 5242880),
  draft boolean not null default false,
  processed boolean not null default false,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table peptide_log_entries
  add column if not exists client_name text not null default 'Sean'
  check (client_name in ('Sean', 'Vanessa'));

create index if not exists peptide_log_entries_client_idx
  on peptide_log_entries (client_name);

create index if not exists peptide_log_entries_peptide_idx
  on peptide_log_entries (peptide_name);

create index if not exists peptide_log_entries_admin_date_idx
  on peptide_log_entries (administration_date desc);

create index if not exists peptide_log_entries_processed_idx
  on peptide_log_entries (processed);


create index if not exists peptide_log_entries_client_idx
  on peptide_log_entries (client_name);
