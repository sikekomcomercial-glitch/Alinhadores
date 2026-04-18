import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "npm:web-push";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configure Web Push Keys
// In deployment, set these via supabase secrets set
const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const privateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const subject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@alinhadores.com";

webpush.setVapidDetails(subject, publicKey, privateKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { "Access-Control-Allow-Origin": "*" } });

  try {
    const { patientId, title, message } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Subscriptions for patient
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("patient_id", patientId);

    if (error || !subs) throw new Error("No subscriptions found");

    // 2. Dispatch to each subscription
    const payload = JSON.stringify({ title, body: message });
    
    for (const sub of subs) {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };

      try {
        await webpush.sendNotification(pushSub, payload);
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Excluir inscrição morta
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    // 3. Save to History
    await supabase.from("notification_history").insert({
       patient_id: patientId, title, message
    });

    return new Response(JSON.stringify({ success: true, count: subs.length }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
