CREATE TYPE "ShootExtraContentType" AS ENUM ('PIC', 'REEL');

ALTER TABLE "ShootExtraContent"
ADD COLUMN "type" "ShootExtraContentType",
ADD COLUMN "referenceLink" TEXT;
