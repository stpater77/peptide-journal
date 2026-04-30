create table if not exists weekly_peptide_schedule (
  id bigserial primary key,
  entry_id text unique not null,
  person_name text not null check (person_name in ('Sean', 'Vanessa')),
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
