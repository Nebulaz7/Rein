-- CreateTable
CREATE TABLE "calendar_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_type" TEXT,
    "expiry_date" BIGINT,
    "scope" TEXT,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resolutionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "scheduledDate" DATE NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "node_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "calendar_connections_user_id_key" ON "calendar_connections"("user_id");

-- CreateIndex
CREATE INDEX "node_progress_userId_scheduledDate_idx" ON "node_progress"("userId", "scheduledDate");

-- CreateIndex
CREATE INDEX "node_progress_userId_status_idx" ON "node_progress"("userId", "status");

-- CreateIndex
CREATE INDEX "node_progress_resolutionId_idx" ON "node_progress"("resolutionId");

-- CreateIndex
CREATE INDEX "node_progress_scheduledDate_idx" ON "node_progress"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "node_progress_userId_resolutionId_nodeId_key" ON "node_progress"("userId", "resolutionId", "nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_userId_key" ON "streaks"("userId");

-- CreateIndex
CREATE INDEX "streaks_userId_idx" ON "streaks"("userId");

-- CreateIndex
CREATE INDEX "resolutions_userId_idx" ON "resolutions"("userId");

-- AddForeignKey
ALTER TABLE "resolutions" ADD CONSTRAINT "resolutions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_progress" ADD CONSTRAINT "node_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_progress" ADD CONSTRAINT "node_progress_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "resolutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
