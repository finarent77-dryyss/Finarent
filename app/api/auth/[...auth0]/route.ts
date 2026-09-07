import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Next.js 15 passes params as a Promise — unwrap before passing to Auth0
async function handler(req: NextRequest, ctx: { params: Promise<{ auth0: string[] }> }) {
  const resolvedParams = await ctx.params;
  const auth = handleAuth({
    login: handleLogin({
      returnTo: '/espace',
      authorizationParams: {
        prompt: 'login',
      },
    }),
    logout: handleLogout({
      returnTo: '/',
    }),
    /**
     * Sans ceci, un echec de connexion se resume a un « HTTP ERROR 400 » nu
     * dans le navigateur : impossible de distinguer un cookie d'etat manquant
     * (page de callback rechargee), d'un AUTH0_SECRET modifie en cours de
     * parcours, ou d'une URL de retour non autorisee. On journalise le motif
     * exact cote serveur — visible dans les logs Clever Cloud — tout en
     * gardant un message neutre pour le visiteur.
     */
    onError(req: NextRequest, error: any) {
      console.error(
        '[auth0] echec du parcours de connexion',
        JSON.stringify({
          route: new URL(req.url).pathname,
          nom: error?.name,
          message: error?.message,
          code: error?.code,
          cause: error?.cause?.message,
          statut: error?.status,
        }),
      );
      return NextResponse.json(
        { error: "La connexion a échoué. Relancez-la depuis la page d'accueil." },
        { status: error?.status || 400 },
      );
    },
  });
  return auth(req, { params: resolvedParams } as any);
}

export { handler as GET, handler as POST };
