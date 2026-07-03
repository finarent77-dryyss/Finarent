import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Borne le pool de connexions Prisma.
 * L'addon PostgreSQL Clever Cloud (plan mutualisé) limite le nombre de
 * connexions par rôle (~5). Sans borne, Prisma ouvre (nb_cpus * 2 + 1)
 * connexions et sature la base — en particulier pendant un redéploiement où
 * l'ancienne et la nouvelle instance coexistent, ce qui provoque
 * « FATAL: too many connections for role ».
 */
function pooledDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes('connection_limit')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}connection_limit=3&pool_timeout=20`;
}

const datasourceUrl = pooledDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
