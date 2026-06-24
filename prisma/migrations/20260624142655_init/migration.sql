/*
  Warnings:

  - You are about to drop the column `companyId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `companies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feedbacks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `surveys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `units` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `alerts` DROP FOREIGN KEY `alerts_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `alerts` DROP FOREIGN KEY `alerts_feedbackId_fkey`;

-- DropForeignKey
ALTER TABLE `feedbacks` DROP FOREIGN KEY `feedbacks_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `feedbacks` DROP FOREIGN KEY `feedbacks_surveyId_fkey`;

-- DropForeignKey
ALTER TABLE `feedbacks` DROP FOREIGN KEY `feedbacks_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `surveys` DROP FOREIGN KEY `surveys_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `surveys` DROP FOREIGN KEY `surveys_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `units` DROP FOREIGN KEY `units_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_companyId_fkey`;

-- DropIndex
DROP INDEX `users_companyId_idx` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `companyId`,
    DROP COLUMN `name`,
    DROP COLUMN `role`;

-- DropTable
DROP TABLE `alerts`;

-- DropTable
DROP TABLE `companies`;

-- DropTable
DROP TABLE `feedbacks`;

-- DropTable
DROP TABLE `surveys`;

-- DropTable
DROP TABLE `units`;
