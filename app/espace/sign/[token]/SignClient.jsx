'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

const eur = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    .format(Number(n) || 0);

export default function SignClient({ token }) {
  const [infos, setInfos] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [consentement, setConsentement] = useState(false);
  const [aSigne, setASigne] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState(null);

  const canvasRef = useRef(null);
  const dessine = useRef(false);

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Lien invalide');
        setInfos(d);
      })
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }, [token]);

  // Le canvas est dimensionné en pixels réels pour rester net sur mobile :
  // un trait flou n'inspire pas confiance sur un document contractuel.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !infos) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#10253C';
  }, [infos]);

  const position = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  };

  const debut = useCallback((e) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = position(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    dessine.current = true;
  }, []);

  const trace = useCallback((e) => {
    if (!dessine.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = position(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setASigne(true);
  }, []);

  const fin = useCallback(() => { dessine.current = false; }, []);

  const effacer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setASigne(false);
  };

  const signer = async () => {
    if (!aSigne || !consentement || envoi) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const r = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: canvasRef.current.toDataURL('image/png'),
          consentement: true,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Échec de la signature');
      setResultat(d);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) {
    return <p className="text-gray-500 text-sm">Chargement du document…</p>;
  }

  if (resultat) {
    return (
      <div className="bg-white rounded-2xl border border-accent/30 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-check text-2xl"></i>
        </div>
        <h2 className="text-xl font-bold text-primary mb-2">Contrat signé</h2>
        <p className="text-gray-600 text-sm mb-6">
          Votre signature a été enregistrée le{' '}
          {new Date(resultat.signedAt).toLocaleString('fr-FR')}.
          Une copie du document signé est conservée dans votre espace.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={`/api/sign/${token}/document`} target="_blank" rel="noopener noreferrer"
             className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-primary hover:border-secondary">
            Télécharger le contrat signé
          </a>
          <Link href="/espace"
                className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-secondary/90">
            Retour à mon espace
          </Link>
        </div>
      </div>
    );
  }

  if (erreur && !infos) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <h2 className="text-lg font-bold text-primary mb-2">Signature indisponible</h2>
        <p className="text-gray-600 text-sm mb-6">{erreur}</p>
        <Link href="/espace" className="text-secondary font-bold text-sm hover:underline">
          Retour à mon espace
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
          Conditions du contrat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['Montant', eur(infos.montant)],
            ['Durée', `${infos.duree} mois`],
            ['Mensualité', eur(infos.mensualite)],
            ['Taux', `${infos.taux} %`],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{l}</div>
              <div className="text-lg font-bold text-primary">{v}</div>
            </div>
          ))}
        </div>
        <a href={infos.urlDocument} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-secondary hover:underline">
          <i className="fa-solid fa-file-pdf"></i> Lire le contrat en entier
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">
          Votre signature
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Signez dans le cadre, au doigt sur mobile ou à la souris.
        </p>

        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-44 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 touch-none cursor-crosshair"
            onMouseDown={debut} onMouseMove={trace} onMouseUp={fin} onMouseLeave={fin}
            onTouchStart={debut} onTouchMove={trace} onTouchEnd={fin}
          />
          {!aSigne && (
            <span className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm pointer-events-none">
              Signez ici
            </span>
          )}
        </div>

        <button type="button" onClick={effacer}
                className="mt-3 text-xs font-bold text-gray-500 hover:text-primary">
          Effacer et recommencer
        </button>

        <label className="flex items-start gap-3 mt-6 cursor-pointer">
          <input type="checkbox" checked={consentement}
                 onChange={(e) => setConsentement(e.target.checked)}
                 className="mt-1 w-4 h-4 accent-emerald-600 shrink-0" />
          <span className="text-xs text-gray-600 leading-relaxed">{infos.mentionConsentement}</span>
        </label>

        {erreur && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {erreur}
          </p>
        )}

        <button type="button" onClick={signer} disabled={!aSigne || !consentement || envoi}
                className="mt-6 w-full py-3.5 rounded-xl bg-secondary text-white font-bold text-sm
                           disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                           hover:bg-secondary/90 transition-colors">
          {envoi ? 'Enregistrement…' : 'Signer le contrat'}
        </button>

        <p className="mt-3 text-[11px] text-gray-400 text-center">
          La date, votre adresse IP et l'empreinte du document sont enregistrées comme preuve.
        </p>
      </div>
    </div>
  );
}
