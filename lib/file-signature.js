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

  // WebP : conteneur RIFF, marqueur « WEBP » en octets 8-11.
  const isWebp =
    b.length >= 12 &&
    b.toString('ascii', 0, 4) === 'RIFF' &&
    b.toString('ascii', 8, 12) === 'WEBP';

  // HEIC / HEIF : conteneur ISO-BMFF, « ftyp » en octets 4-7 puis la marque en 8-11.
  // Format par défaut des photos iPhone depuis iOS 11.
  const HEIF_BRANDS = new Set([
    'heic', 'heix', 'hevc', 'hevx',
    'heim', 'heis', 'hevm', 'hevs',
    'mif1', 'msf1',
  ]);
  const isHeif =
    b.length >= 12 &&
    b.toString('ascii', 4, 8) === 'ftyp' &&
    HEIF_BRANDS.has(b.toString('ascii', 8, 12));

  switch (mimeType) {
    case 'application/pdf':
      return isPdf;
    case 'image/jpeg':
    case 'image/jpg':
      return isJpg;
    case 'image/png':
      return isPng;
    case 'image/webp':
      return isWebp;
    case 'image/heic':
    case 'image/heif':
      return isHeif;
    default:
      return false;
  }
}
