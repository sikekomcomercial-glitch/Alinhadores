-- patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS setup
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their own patients" 
  ON patients FOR ALL USING (auth.uid() = dentist_id);

CREATE POLICY "Dentists can manage events for their patients" 
  ON events FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients WHERE patients.id = events.patient_id AND patients.dentist_id = auth.uid()
    )
  );
