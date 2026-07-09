-- CreateEnum
CREATE TYPE "FollowUpMessageType" AS ENUM ('INITIAL', 'FOLLOW_UP', 'REPLY');

-- CreateEnum
CREATE TYPE "EscalationStatus" AS ENUM ('PENDING', 'MANAGER_NOTIFIED', 'HR_ESCALATED', 'ADMIN_ESCALATED', 'FINAL_ESCALATED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'HR', 'EA', 'MANAGER', 'EMPLOYEE', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'HALF_DAY', 'ABSENT', 'HOLIDAY', 'LEAVE');

-- CreateEnum
CREATE TYPE "SetupType" AS ENUM ('PREMIUM', 'VERY_PREMIUM', 'PHONE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED', 'PENDING', 'UNABLE_TO_SUBMIT');

-- CreateEnum
CREATE TYPE "NotificationLevel" AS ENUM ('INFO', 'WARNING', 'ESCALATION', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TASK_ASSIGNED', 'TASK_REMINDER', 'TASK_SUBMITTED', 'TASK_OVERDUE', 'MANAGER_REMINDER', 'HR_ESCALATION', 'ADMIN_ESCALATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('CASUAL', 'SICK');

-- CreateEnum
CREATE TYPE "TaskItemStatus" AS ENUM ('DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'COMPLETED', 'PENDING', 'UNABLE_TO_SUBMIT');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('SHOOT', 'AI');

-- CreateEnum
CREATE TYPE "ShootSubTaskType" AS ENUM ('PIC', 'REEL');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('HORIZONTAL', 'VERTICAL');

-- CreateEnum
CREATE TYPE "ShootSubTaskStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'UNABLE_TO_SUBMIT');

-- CreateEnum
CREATE TYPE "EscalationType" AS ENUM ('NEXT_DAY_MISSING', 'FUTURE_4_DAYS_MISSING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "position" TEXT,
    "managerId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departmentId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "totalHours" DOUBLE PRECISION,
    "breakHours" DOUBLE PRECISION,
    "status" "AttendanceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Break" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Break_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "endDate" TIMESTAMP(3) NOT NULL,
    "projectName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "startedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "workDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "completedCount" INTEGER NOT NULL,
    "pendingCount" INTEGER NOT NULL,
    "driveLink" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "verifiedByManager" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TaskSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityId" TEXT,
    "level" "NotificationLevel",
    "readAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leave" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "days" INTEGER NOT NULL,
    "type" "LeaveType" NOT NULL,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "casual" INTEGER NOT NULL DEFAULT 14,
    "sick" INTEGER NOT NULL DEFAULT 6,
    "usedCasual" INTEGER NOT NULL DEFAULT 0,
    "usedSick" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskEscalation" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminEscalatedAt" TIMESTAMP(3),
    "adminMailSent" BOOLEAN NOT NULL DEFAULT false,
    "employeeId" TEXT NOT NULL,
    "finalEscalatedAt" TIMESTAMP(3),
    "hrEscalatedAt" TIMESTAMP(3),
    "hrMailSent" BOOLEAN NOT NULL DEFAULT false,
    "managerMailSent" BOOLEAN NOT NULL DEFAULT false,
    "popupSent" BOOLEAN NOT NULL DEFAULT false,
    "reminder1SentAt" TIMESTAMP(3),
    "reminder2SentAt" TIMESTAMP(3),
    "reminder3SentAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "status" "EscalationStatus" NOT NULL DEFAULT 'PENDING',
    "type" "EscalationType" NOT NULL DEFAULT 'NEXT_DAY_MISSING',

    CONSTRAINT "TaskEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskItem" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER,
    "status" "TaskItemStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "referenceLink" TEXT,
    "rawDataLink" TEXT,

    CONSTRAINT "TaskItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskItemSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "driveLink" TEXT,
    "remarks" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedByManager" BOOLEAN NOT NULL DEFAULT false,
    "unableToSubmitReason" TEXT,

    CONSTRAINT "TaskItemSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskItemAssignment" (
    "id" TEXT NOT NULL,
    "taskItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "startedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "TaskItemAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShootWorkspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShootWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShootWorkspaceMember" (
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShootWorkspaceMember_pkey" PRIMARY KEY ("workspaceId","userId")
);

-- CreateTable
CREATE TABLE "ShootTask" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "noOfPics" INTEGER NOT NULL DEFAULT 0,
    "noOfReels" INTEGER NOT NULL DEFAULT 0,
    "date" TEXT,
    "arrivalTime" TEXT,
    "location" TEXT,
    "setupType" "SetupType",
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShootTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShootSubTask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dayId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ShootSubTaskType" NOT NULL,
    "referenceLinks" TEXT[],
    "videoType" "VideoType" NOT NULL,
    "setupType" "SetupType" DEFAULT 'PREMIUM',
    "submissionLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unableToSubmitReason" TEXT,
    "submittedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "status" "ShootSubTaskStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShootSubTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3),
    "frequency" TEXT,
    "clientName" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "fbEmail" TEXT,
    "fbPassword" TEXT,
    "instaEmail" TEXT,
    "instaPassword" TEXT,
    "projectStartDate" TIMESTAMP(3),
    "referenceLink" TEXT,
    "tasteLink" TEXT,
    "linkedinEmail" TEXT,
    "linkedinPassword" TEXT,
    "youtubeEmail" TEXT,
    "youtubePassword" TEXT,
    "twitterEmail" TEXT,
    "twitterPassword" TEXT,
    "logo" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAssignment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMonthlySheet" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalReels" INTEGER NOT NULL,
    "totalPosts" INTEGER NOT NULL,
    "totalReelsUploaded" INTEGER NOT NULL,
    "totalPostsUploaded" INTEGER NOT NULL,
    "moodBoardLink" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMonthlySheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMonthlySheetDay" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reelType" "MediaSource",
    "postType" "MediaSource",
    "videoType" "VideoType",
    "title" TEXT,
    "referenceLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "submissionLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "script" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMonthlySheetDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDepartment" (
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDepartment_pkey" PRIMARY KEY ("userId","departmentId")
);

-- CreateTable
CREATE TABLE "UserManager" (
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserManager_pkey" PRIMARY KEY ("employeeId","managerId")
);

-- CreateTable
CREATE TABLE "EmployeeTaskCoverage" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "taskCount" INTEGER NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeTaskCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoordinatorAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "employeeNumber" TEXT NOT NULL,
    "employeeEmail" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoordinatorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoordinatorFollowUp" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" "FollowUpMessageType" NOT NULL DEFAULT 'FOLLOW_UP',
    "senderRole" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoordinatorFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_date_key" ON "Attendance"("userId", "date");

-- CreateIndex
CREATE INDEX "Task_createdById_idx" ON "Task"("createdById");

-- CreateIndex
CREATE INDEX "Task_startDate_idx" ON "Task"("startDate");

-- CreateIndex
CREATE INDEX "Task_endDate_idx" ON "Task"("endDate");

-- CreateIndex
CREATE INDEX "TaskAssignment_workDate_idx" ON "TaskAssignment"("workDate");

-- CreateIndex
CREATE INDEX "TaskAssignment_userId_workDate_idx" ON "TaskAssignment"("userId", "workDate");

-- CreateIndex
CREATE INDEX "TaskAssignment_userId_idx" ON "TaskAssignment"("userId");

-- CreateIndex
CREATE INDEX "TaskAssignment_status_idx" ON "TaskAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_taskId_userId_key" ON "TaskAssignment"("taskId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSubmission_assignmentId_key" ON "TaskSubmission"("assignmentId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Leave_userId_idx" ON "Leave"("userId");

-- CreateIndex
CREATE INDEX "Leave_status_idx" ON "Leave"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_userId_year_key" ON "LeaveBalance"("userId", "year");

-- CreateIndex
CREATE INDEX "TaskEscalation_managerId_idx" ON "TaskEscalation"("managerId");

-- CreateIndex
CREATE INDEX "TaskEscalation_status_idx" ON "TaskEscalation"("status");

-- CreateIndex
CREATE INDEX "TaskEscalation_date_idx" ON "TaskEscalation"("date");

-- CreateIndex
CREATE UNIQUE INDEX "TaskEscalation_employeeId_date_type_key" ON "TaskEscalation"("employeeId", "date", "type");

-- CreateIndex
CREATE INDEX "TaskItem_taskId_idx" ON "TaskItem"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskItemSubmission_assignmentId_key" ON "TaskItemSubmission"("assignmentId");

-- CreateIndex
CREATE INDEX "TaskItemAssignment_userId_idx" ON "TaskItemAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskItemAssignment_taskItemId_userId_key" ON "TaskItemAssignment"("taskItemId", "userId");

-- CreateIndex
CREATE INDEX "ShootWorkspace_createdById_idx" ON "ShootWorkspace"("createdById");

-- CreateIndex
CREATE INDEX "ShootWorkspaceMember_userId_idx" ON "ShootWorkspaceMember"("userId");

-- CreateIndex
CREATE INDEX "ShootTask_workspaceId_idx" ON "ShootTask"("workspaceId");

-- CreateIndex
CREATE INDEX "ShootTask_createdById_idx" ON "ShootTask"("createdById");

-- CreateIndex
CREATE INDEX "ShootSubTask_taskId_idx" ON "ShootSubTask"("taskId");

-- CreateIndex
CREATE INDEX "ShootSubTask_dayId_idx" ON "ShootSubTask"("dayId");

-- CreateIndex
CREATE INDEX "ShootSubTask_submittedById_idx" ON "ShootSubTask"("submittedById");

-- CreateIndex
CREATE INDEX "ShootSubTask_reviewedById_idx" ON "ShootSubTask"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "ProjectAssignment_managerId_idx" ON "ProjectAssignment"("managerId");

-- CreateIndex
CREATE INDEX "ProjectAssignment_projectId_idx" ON "ProjectAssignment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAssignment_projectId_managerId_key" ON "ProjectAssignment"("projectId", "managerId");

-- CreateIndex
CREATE INDEX "ProjectMonthlySheet_projectId_idx" ON "ProjectMonthlySheet"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMonthlySheet_createdById_idx" ON "ProjectMonthlySheet"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMonthlySheet_projectId_month_year_key" ON "ProjectMonthlySheet"("projectId", "month", "year");

-- CreateIndex
CREATE INDEX "ProjectMonthlySheetDay_sheetId_idx" ON "ProjectMonthlySheetDay"("sheetId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMonthlySheetDay_sheetId_date_key" ON "ProjectMonthlySheetDay"("sheetId", "date");

-- CreateIndex
CREATE INDEX "EmployeeTaskCoverage_managerId_idx" ON "EmployeeTaskCoverage"("managerId");

-- CreateIndex
CREATE INDEX "EmployeeTaskCoverage_date_idx" ON "EmployeeTaskCoverage"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTaskCoverage_employeeId_date_key" ON "EmployeeTaskCoverage"("employeeId", "date");

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_createdById_idx" ON "CoordinatorAssignment"("createdById");

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_assignedToId_idx" ON "CoordinatorAssignment"("assignedToId");

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_status_idx" ON "CoordinatorAssignment"("status");

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_assignedTime_idx" ON "CoordinatorAssignment"("assignedTime");

-- CreateIndex
CREATE UNIQUE INDEX "CoordinatorAssignment_taskId_assignedToId_key" ON "CoordinatorAssignment"("taskId", "assignedToId");

-- CreateIndex
CREATE INDEX "CoordinatorFollowUp_assignmentId_idx" ON "CoordinatorFollowUp"("assignmentId");

-- CreateIndex
CREATE INDEX "CoordinatorFollowUp_senderId_idx" ON "CoordinatorFollowUp"("senderId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Break" ADD CONSTRAINT "Break_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TaskAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskEscalation" ADD CONSTRAINT "TaskEscalation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskEscalation" ADD CONSTRAINT "TaskEscalation_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItem" ADD CONSTRAINT "TaskItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItemSubmission" ADD CONSTRAINT "TaskItemSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TaskItemAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItemAssignment" ADD CONSTRAINT "TaskItemAssignment_taskItemId_fkey" FOREIGN KEY ("taskItemId") REFERENCES "TaskItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItemAssignment" ADD CONSTRAINT "TaskItemAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootWorkspace" ADD CONSTRAINT "ShootWorkspace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootWorkspaceMember" ADD CONSTRAINT "ShootWorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ShootWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootWorkspaceMember" ADD CONSTRAINT "ShootWorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootTask" ADD CONSTRAINT "ShootTask_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ShootWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootTask" ADD CONSTRAINT "ShootTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootSubTask" ADD CONSTRAINT "ShootSubTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ShootTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootSubTask" ADD CONSTRAINT "ShootSubTask_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "ProjectMonthlySheetDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootSubTask" ADD CONSTRAINT "ShootSubTask_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShootSubTask" ADD CONSTRAINT "ShootSubTask_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMonthlySheet" ADD CONSTRAINT "ProjectMonthlySheet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMonthlySheet" ADD CONSTRAINT "ProjectMonthlySheet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMonthlySheetDay" ADD CONSTRAINT "ProjectMonthlySheetDay_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "ProjectMonthlySheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDepartment" ADD CONSTRAINT "UserDepartment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDepartment" ADD CONSTRAINT "UserDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserManager" ADD CONSTRAINT "UserManager_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserManager" ADD CONSTRAINT "UserManager_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTaskCoverage" ADD CONSTRAINT "EmployeeTaskCoverage_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeTaskCoverage" ADD CONSTRAINT "EmployeeTaskCoverage_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorAssignment" ADD CONSTRAINT "CoordinatorAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorAssignment" ADD CONSTRAINT "CoordinatorAssignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorAssignment" ADD CONSTRAINT "CoordinatorAssignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorFollowUp" ADD CONSTRAINT "CoordinatorFollowUp_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "CoordinatorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorFollowUp" ADD CONSTRAINT "CoordinatorFollowUp_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
