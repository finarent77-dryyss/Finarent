import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

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
  });
  return auth(req, { params: resolvedParams } as any);
}

export { handler as GET, handler as POST };
