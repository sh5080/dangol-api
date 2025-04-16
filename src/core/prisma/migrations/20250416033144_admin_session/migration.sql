-- CreateTable
CREATE TABLE "AdminSession" (
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_userId_key" ON "AdminSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_token_key" ON "AdminSession"("token");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
