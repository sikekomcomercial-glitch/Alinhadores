import { createClient } from "./supabaseBrowser";

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushService = {
  async subscribe(patientId: string) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { error: "Push notifications não suportadas no navegador." };
    }

    try {
      const sw = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) return { error: "VAPID key não configurada" };

      const sub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      const subData = JSON.parse(JSON.stringify(sub));

       // Verifica modo mock antes
      const match = document.cookie.match(/next-auth\.demo-session=([^;]+)/);
      if (match) {
         console.log("[Demo Mode] Inscrição Push gerada:", subData);
         return { success: true };
      }

      const supabase = createClient();
      await supabase.from("push_subscriptions").insert({
        patient_id: patientId,
        endpoint: subData.endpoint,
        p256dh: subData.keys.p256dh,
        auth: subData.keys.auth
      });

      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { error: e.message };
    }
  }
};
