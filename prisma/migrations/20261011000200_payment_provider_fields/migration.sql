CREATE TYPE "PaymentProvider" AS ENUM ('MANUAL', 'KHALTI', 'ESEWA');

ALTER TABLE "TournamentPurchase"
  ADD COLUMN "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "providerPaymentId" TEXT,
  ADD COLUMN "checkoutUrl" TEXT;

CREATE UNIQUE INDEX "TournamentPurchase_providerPaymentId_key" ON "TournamentPurchase"("providerPaymentId");
