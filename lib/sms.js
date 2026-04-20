/**
 * Abstraction SMS avec fallback console log si Twilio non configuré.
 * Prêt pour Twilio quand les credentials sont fournis.
 */
const useTwilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER;

let twilioClient = null;
if (useTwilio) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.warn('Twilio package not installed. SMS disabled.');
  }
}

export async function sendSMS(to, message) {
  if (!to || !message) return { success: false, error: 'Missing to or message' };

  // Normalise French numbers to E.164
  let normalized = to.replace(/\s+/g, '');
  if (normalized.startsWith('0')) normalized = '+33' + normalized.slice(1);

  if (!twilioClient) {
    console.log(`[SMS:MOCK] to=${normalized} message="${message}"`);
    return { success: true, mock: true };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER,
      to: normalized,
    });
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error('SMS send failed:', err.message);
    return { success: false, error: err.message };
  }
}

// Convenience functions for common SMS
export const smsTemplates = {
  dossierRecu: (prenom, lienCourt) =>
    `Bonjour ${prenom}, votre demande Finassur est bien reçue. Suivez votre dossier: ${lienCourt}`,
  docManquant: (lienCourt) =>
    `Action requise: un document est à remettre pour votre dossier Finassur. ${lienCourt}`,
  offreDisponible: (mensualite, duree, lienCourt) =>
    `Votre offre Finassur est prête: ${mensualite}€/mois sur ${duree} mois. Consultez: ${lienCourt}`,
  rappelOffre: (lienCourt) =>
    `Rappel: votre offre Finassur expire dans 2 jours. Ne la manquez pas: ${lienCourt}`,
  signatureRequise: (lienCourt) =>
    `Finalisez votre financement: signez votre contrat en ligne. ${lienCourt}`,
  felicitations: (prenom) =>
    `Félicitations ${prenom} ! Votre financement Finassur est accordé. Bienvenue dans notre réseau !`,
};
