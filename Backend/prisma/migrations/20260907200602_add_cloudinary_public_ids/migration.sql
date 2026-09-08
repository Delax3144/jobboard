-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "cvPublicId" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "companyLogoPublicId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarPublicId" TEXT,
ADD COLUMN     "resumePublicId" TEXT;
