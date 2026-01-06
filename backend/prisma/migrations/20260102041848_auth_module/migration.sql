/*
  Warnings:

  - The values [GOOGLE,GITHUB,CRENDENTIALS] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('Google', 'Github', 'Credentials');
ALTER TABLE "User" ALTER COLUMN "providers" TYPE "AuthProvider_new"[] USING ("providers"::text::"AuthProvider_new"[]);
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "public"."AuthProvider_old";
COMMIT;
