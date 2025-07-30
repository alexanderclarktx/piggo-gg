-- CreateTable
CREATE TABLE "highscores" (
    "id" TEXT NOT NULL,
    "userId" CITEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "highscores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "highscores_score_idx" ON "highscores"("score");

-- CreateIndex
CREATE UNIQUE INDEX "highscores_userId_createdAt_key" ON "highscores"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "highscores" ADD CONSTRAINT "highscores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
