import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Esta função deve ser agendada no pg_cron do banco de dados supabase ou via pg_net
// EX: select cron.schedule('invoke_push_scheduler', '0 12 * * *', $$ select net.http_post('https://[PROJECT-REF].supabase.co/functions/v1/push-scheduler', ...); $$)

serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Calcular Data Daqui a 3 Dias (Formato YYYY-MM-DD)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  // 1. Procurar Eventos que ocorrem na Data Alvo de tipo 'aligner_change'
  const { data: events, error } = await supabase
    .from("events")
    .select("*, patient_id")
    .eq("type", "aligner_change")
    .eq("date", targetDateStr);

  if (error || !events || events.length === 0) {
    return new Response(JSON.stringify({ message: "Sem alinhadores para trocar em 3 dias." }), { headers: { "Content-Type": "application/json" } });
  }

  // 2. Disparar para a Cloud Function send-push para cada paciente
  let disparos = 0;
  for (const event of events) {
    await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        patientId: event.patient_id,
        title: "Troca de Alinhador Próxima!",
        message: `Faltam 3 dias para a troca da placa: ${event.title}. Mantenha o uso rigoroso!`
      })
    });
    disparos++;
  }

  return new Response(JSON.stringify({ success: true, pushes_triggered: disparos }), {
    headers: { "Content-Type": "application/json" },
  });
});
