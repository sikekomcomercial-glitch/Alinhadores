-- Criação das tabelas de Push, Modelos e Históricos

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pacientes gerenciam próprias inscrições" ON public.push_subscriptions FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "Dentistas leem inscrições" ON public.push_subscriptions FOR SELECT USING (true); -- Dentista via edge function terá acesso


CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura livre para web auth" ON public.notification_templates FOR SELECT USING (true);
CREATE POLICY "Apenas dentistas gerenciam templates" ON public.notification_templates FOR ALL USING (auth.jwt() ->> 'role' = 'dentista');


CREATE TABLE IF NOT EXISTS public.form_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    questions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura livre para web auth forms" ON public.form_templates FOR SELECT USING (true);


CREATE TABLE IF NOT EXISTS public.notification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pacientes leem próprio histórico" ON public.notification_history FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Dentistas leem histórico" ON public.notification_history FOR SELECT USING (true);
