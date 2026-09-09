import { prisma } from '@/lib/prisma';
import { marquerConversion } from './referral.js';
import { sendMail } from './email/send.js';
import { templateParrainageConverti, templateParrainageAdmin } from './email/templates.js';

/**
 * Conversion d'un parrainage, déclenchée quand un dossier passe en SIGNED.
 *
 * Deux chemins mènent à un dossier signé — la validation par un administrateur
 * et la signature électronique par le client — et les deux doivent aboutir
 * ici, sinon le statut du parrainage dépend de la façon dont le dossier a été
 * signé.
 *
 * La récompense elle-même n'est pas automatisée : aucune règle commerciale
 * n'existe dans le projet (montant, seuil, forme). On notifie donc le parrain
 * et l'équipe, à charge pour cette dernière d'honorer la contrepartie. C'est
 * volontaire : inventer un barème dans le code engagerait l'entreprise.
 *
 * @param {string} email adresse du filleul (celle du dossier signé)
 */
export async function traiterConversionParrainage(email) {
  const converti = await marquerConversion(prisma, email);
  if (!converti) return null;

  const emailParrain = converti.parrain?.email;
  if (emailParrain) {
    const message = templateParrainageConverti({
      nomFilleul: converti.refereeName,
      emailFilleul: converti.refereeEmail,
    });
    await sendMail({
      to: emailParrain,
      subject: message.subject,
      html: message.html,
      text: message.text,
      log: {
        type: 'TRANSACTIONAL',
        source: 'PARRAINAGE_CONVERTI',
        metadata: { referralId: converti.id, filleul: converti.refereeEmail },
      },
    }).catch((e) => console.error('[parrainage] avis au parrain échoué :', e.message));
  }

  const admin = process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL;
  if (admin) {
    const alerte = templateParrainageAdmin({
      emailParrain: emailParrain || '—',
      emailFilleul: converti.refereeEmail,
    });
    await sendMail({
      to: admin,
      subject: alerte.subject,
      html: alerte.html,
      text: alerte.text,
      log: { type: 'TRANSACTIONAL', source: 'PARRAINAGE_ADMIN', metadata: { referralId: converti.id } },
    }).catch((e) => console.error('[parrainage] alerte admin échouée :', e.message));
  }

  return converti;
}

/** Variante détachée : la conversion ne doit jamais retarder une signature. */
export function traiterConversionParrainageEnFond(email) {
  void traiterConversionParrainage(email).catch((e) =>
    console.error('[parrainage] conversion échouée :', e.message),
  );
}
