-- CreateTable Commission (partenaires — commissions sur dossiers signés)
CREATE TABLE IF NOT EXISTS "Commission" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Commission" ADD CONSTRAINT "Commission_partnerId_fkey"
    FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Indexes Commission (partner stats / timeline)
CREATE INDEX IF NOT EXISTS "Commission_partnerId_idx"           ON "Commission"("partnerId");
CREATE INDEX IF NOT EXISTS "Commission_status_idx"              ON "Commission"("status");
CREATE INDEX IF NOT EXISTS "Commission_partnerId_status_idx"    ON "Commission"("partnerId", "status");
CREATE INDEX IF NOT EXISTS "Commission_partnerId_createdAt_idx" ON "Commission"("partnerId", "createdAt");
