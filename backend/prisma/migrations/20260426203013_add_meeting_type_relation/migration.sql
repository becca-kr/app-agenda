/*
  Warnings:

  - You are about to drop the column `description` on the `Meeting` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Meeting" DROP COLUMN "description",
ADD COLUMN     "meetingTypeId" TEXT,
ADD COLUMN     "roomId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_meetingTypeId_fkey" FOREIGN KEY ("meetingTypeId") REFERENCES "public"."MeetingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
