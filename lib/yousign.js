/**
 * Abstraction YouSign API v3 avec fallback stub pour dev.
 * Activé automatiquement si YOUSIGN_API_KEY est défini.
 */
const useYouSign = !!process.env.YOUSIGN_API_KEY;
const BASE_URL = process.env.YOUSIGN_BASE_URL || 'https://api.yousign.app/v3';

/**
 * Lance une procédure de signature eIDAS.
 * @returns {Promise<{procedureId, signUrl, mock?}>}
 */
export async function createSignatureProcedure({ documentBuffer, filename, signer, offerId }) {
  if (!useYouSign) {
    console.log(`[YOUSIGN:MOCK] procedure created for offer=${offerId} signer=${signer.email}`);
    return {
      procedureId: `mock_proc_${Date.now()}`,
      signUrl: `/espace/sign/mock-${offerId}`,
      mock: true,
    };
  }

  // Step 1: Create signature request
  const createReq = await fetch(`${BASE_URL}/signature_requests`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.YOUSIGN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `Contrat Finarent - Offre ${offerId}`,
      delivery_mode: 'email',
      timezone: 'Europe/Paris',
    }),
  });
  const request = await createReq.json();

  // Step 2: Upload document (multipart)
  const formData = new FormData();
  formData.append('file', new Blob([documentBuffer]), filename);
  formData.append('nature', 'signable_document');

  const uploadReq = await fetch(`${BASE_URL}/signature_requests/${request.id}/documents`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.YOUSIGN_API_KEY}` },
    body: formData,
  });
  const document = await uploadReq.json();

  // Step 3: Add signer
  const signerReq = await fetch(`${BASE_URL}/signature_requests/${request.id}/signers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.YOUSIGN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        first_name: signer.firstName || 'Client',
        last_name: signer.lastName || '',
        email: signer.email,
        phone_number: signer.phone || '',
        locale: 'fr',
      },
      signature_level: 'electronic_signature',
      signature_authentication_mode: 'otp_email',
    }),
  });
  const signerData = await signerReq.json();

  // Step 4: Activate the request
  await fetch(`${BASE_URL}/signature_requests/${request.id}/activate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.YOUSIGN_API_KEY}` },
  });

  return {
    procedureId: request.id,
    signUrl: signerData.signature_link || null,
  };
}

/**
 * Récupère le statut d'une procédure.
 */
export async function getProcedureStatus(procedureId) {
  if (!useYouSign || procedureId.startsWith('mock_')) {
    return { status: 'done', mock: true };
  }

  const res = await fetch(`${BASE_URL}/signature_requests/${procedureId}`, {
    headers: { 'Authorization': `Bearer ${process.env.YOUSIGN_API_KEY}` },
  });
  return res.json();
}

export const youSignEnabled = useYouSign;
