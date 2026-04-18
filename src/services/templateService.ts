// Este arquivo simula a interação com o banco nas tabelas 'notification_models' e 'forms'

export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  questions: string[];
}

export const templateService = {
  async getNotificationTemplates() {
    return {
      data: [
         { id: "n1", title: "Lembrete Troca 3 Dias", message: "Faltam 3 dias para você trocar de alinhador!" },
         { id: "n2", title: "Aviso de Consulta", message: "Sua consulta presencial é hoje." }
      ] as NotificationTemplate[],
    };
  },

  async getFormTemplates() {
    return {
      data: [
         { id: "f1", title: "Acompanhamento Mensal", questions: ["Está sentindo dor?", "Quantas horas por dia está usando o alinhador?"] }
      ] as FormTemplate[],
    };
  },

  async sendMassMessage(patientIds: string[], type: "form" | "notification", templateId: string) {
     console.log(`Disparando envio em massa (${type}) via API para os pacientes:`, patientIds, "Template:", templateId);
     // Simular que deu certo e a edge function fez o seu trabalho real na nuvem
     return { success: true };
  }
};
