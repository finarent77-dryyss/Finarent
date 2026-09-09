import { NextResponse } from 'next/server';

/**
 * Sonde de santé (CC_HEALTH_CHECK_PATH côté Clever Cloud).
 *
 * Volontairement minimale : elle est publique et appelée en continu.
 * On n'y expose donc aucune information d'environnement (NODE_ENV, PORT,
 * HOSTNAME…) et on n'écrit rien dans les journaux, qui seraient noyés.
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        time: new Date().toISOString(),
    });
}
