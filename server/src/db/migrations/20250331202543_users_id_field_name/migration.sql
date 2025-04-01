/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_user2Id_fkey";

-- AlterTable
ALTER TABLE "friends" ALTER COLUMN "user1Id" SET DATA TYPE CITEXT,
ALTER COLUMN "user2Id" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("name");

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
