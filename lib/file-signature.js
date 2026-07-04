/**
 * Vérification des « magic bytes » d'un fichier téléversé.
 * Le type MIME déclaré par le client (`file.type`) est falsifiable ;
 * on confirme le vrai format via les octets d'en-tête.
 */
export function sniffMatchesMime(buffer, mimeType) {
  if (!buffer || buffer.length < 4) return false;
  const b = buffer;

  const isPdf = b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46; // %PDF
  const isJpg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;                   // JPEG
  const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;  // \x89PNG

  switch (mimeType) {
    case 'application/pdf':
      return isPdf;
    case 'image/jpeg':
    case 'image/jpg':
      return isJpg;
    case 'image/png':
      return isPng;
    default:
      return false;
  }
}
