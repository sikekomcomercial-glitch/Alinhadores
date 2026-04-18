-- V2: Features Premium (Timer, Galeria, SOS, White-Label e Protocolos)

CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    is_paused BOOLEAN DEFAULT FALSE,
    date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Paciente gerencia próprio timer" ON public.usage_logs FOR ALL USING (auth.uid() = patient_id);

CREATE TABLE IF NOT EXISTS public.patient_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    aligner_number INT NOT NULL,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.patient_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Paciente acessa fotos" ON public.patient_photos FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Paciente insere fotos" ON public.patient_photos FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Dentista acessa todas as fotos" ON public.patient_photos FOR SELECT USING (true); -- Controle real pelo backend

CREATE TABLE IF NOT EXISTS public.dentist_settings (
    dentist_id UUID PRIMARY KEY, -- Auth ID do dentista
    theme_primary_color TEXT DEFAULT '#A8C5DA',
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

ALTER TABLE public.dentist_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso público ao CSS" ON public.dentist_settings FOR SELECT USING (true);
CREATE POLICY "Dentista atualiza seu tema" ON public.dentist_settings FOR ALL USING (auth.uid() = dentist_id);
