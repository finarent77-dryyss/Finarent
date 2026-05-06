-- Migration: Testimonial model with moderation (April 2026)

CREATE TABLE "Testimonial" (
  "id"          TEXT NOT NULL,
  "authorName"  TEXT NOT NULL,
  "initials"    TEXT NOT NULL,
  "position"    TEXT,
  "company"     TEXT,
  "sector"      TEXT,
  "rating"      INTEGER NOT NULL DEFAULT 5,
  "text"        TEXT NOT NULL,
  "amount"      TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "isApproved"  BOOLEAN NOT NULL DEFAULT false,
  "rejectedAt"  TIMESTAMP(3),
  "approvedAt"  TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Testimonial_isPublished_isApproved_idx"
  ON "Testimonial" ("isPublished", "isApproved");
