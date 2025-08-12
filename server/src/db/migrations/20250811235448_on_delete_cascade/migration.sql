-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_user2Id_fkey";

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("name") ON DELETE CASCADE ON UPDATE CASCADE;
