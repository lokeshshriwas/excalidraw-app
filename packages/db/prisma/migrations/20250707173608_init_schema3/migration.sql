/*
  Warnings:

  - Made the column `message` on table `Chat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "message" SET NOT NULL;
