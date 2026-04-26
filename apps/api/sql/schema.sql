create table if not exists journal_entries (
  id bigserial primary key,
  entry_id text unique not null,
  entry_date date not null,
  peptide_name text not null,
  protocol_phase text not null default 'active',
  dose_amount numeric(12, 4) not null,
  dose_unit text not null default 'mcg',
  administration_route text not null default 'subcutaneous',
  injection_site text,
  lot_number text,
  source text not null default 'web_form',
  mood text default 'not_recorded',
  energy text default 'not_recorded',
  sleep_quality text default 'not_recorded',
  appetite text default 'not_recorded',
  weight_lbs numeric(8, 2),
  observed_effects text,
  side_effects text,
  notes text,
  reminder_requested boolean not null default false,
  follow_up_date date,
  terms_accepted boolean not null default false,
  terms_accepted_at timestamptz,
  terms_accepted_source text,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create index if not exists journal_entries_entry_date_idx
  on journal_entries (entry_date desc);

create index if not exists journal_entries_peptide_name_idx
  on journal_entries (lower(peptide_name));
