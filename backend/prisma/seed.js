require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // =========================
  // DEPARTMENTS
  // =========================

  const departments = {};

  const departmentNames = [
    "SEO",
    "Performance Marketing",
    "Social Media",
    "Content & Creative",
    "Web Development",
    "Sales & Business Development",
    "HR",
    "Video Production",
  ];

  for (const name of departmentNames) {
    departments[name] = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // =========================
  // ADMIN
  // =========================

  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {
      password,
    },
    create: {
      employeeId: "ADMIN-001",
      name: "Admin",
      email: "admin@test.com",
      password,
      role: "ADMIN",
    },
  });

  // =========================
  // HR
  // =========================

  await prisma.user.upsert({
    where: { email: "hrwepromote@gmail.com" },
    update: {
      password,
      departmentId: departments["HR"].id,
    },
    create: {
      employeeId: "HR-001",
      name: "HR User",
      email: "hrwepromote@gmail.com",
      password,
      role: "HR",
      departmentId: departments["HR"].id,
    },
  });

  // =========================
  // PERFORMANCE MARKETING MANAGER
  // =========================

  await prisma.user.upsert({
    where: { email: "ads.wepromoteindia@gmail.com" },
    update: {
      password,
      departmentId: departments["Performance Marketing"].id,
      position: "Performance Marketing Manager",
    },
    create: {
      employeeId: "PM-MGR-001",
      name: "Pankaj",
      email: "ads.wepromoteindia@gmail.com",
      password,
      role: "MANAGER",
      position: "Performance Marketing Manager",
      departmentId: departments["Performance Marketing"].id,
    },
  });

  // =========================
  // SOCIAL MEDIA MANAGER - LOVPRIT
  // =========================

  await prisma.user.upsert({
    where: { email: "smmwepromote@gmail.com" },
    update: {
      password,
      departmentId: departments["Social Media"].id,
      position: "Social Media Manager",
    },
    create: {
      employeeId: "SM-MGR-001",
      name: "Lovprit",
      email: "smmwepromote@gmail.com",
      password,
      role: "MANAGER",
      position: "Social Media Manager",
      departmentId: departments["Social Media"].id,
    },
  });

  await prisma.user.upsert({
  where: { email: "smm02wepromote@gmail.com" },
  update: {
    password,
    departmentId: departments["Content & Creative"].id,
    position: "Content & Creative Manager",
  },
  create: {
    employeeId: "CC-MGR-001",
    name: "Abhijeet",
    email: "smm02wepromote@gmail.com",
    password,
    role: "MANAGER",
    position: "Content & Creative Manager",
    departmentId: departments["Content & Creative"].id,
  },
});

  // =========================
  // COORDINATOR - SONALI
  // =========================

  await prisma.user.upsert({
    where: { email: "ea.wepromote001@gmail.com" },
    update: {
      password,
      departmentId: departments["Social Media"].id,
    },
    create: {
      employeeId: "COORD-001",
      name: "Sonali",
      email: "ea.wepromote001@gmail.com",
      password,
      role: "COORDINATOR",
      departmentId: departments["Social Media"].id,
    },
  });

  // =========================
  // EA - EXECUTIVE ASSISTANT
  // =========================

  await prisma.user.upsert({
    where: { email: "ea.manager@company.com" },
    update: {
      password,
      departmentId: departments["Social Media"].id,
      position: "Executive Assistant",
    },
    create: {
      employeeId: "EA-001",
      name: "EA User",
      email: "ea.manager@company.com",
      password,
      role: "EA",
      position: "Executive Assistant",
      departmentId: departments["Social Media"].id,
    },
  });

  const shootWorkspaceOwner = await prisma.user.findUnique({
    where: { email: "smmwepromote@gmail.com" },
  });

  if (!shootWorkspaceOwner) {
    throw new Error("Shoot workspace owner not found");
  }

  const shootCoordinator = await prisma.user.findUnique({
    where: { email: "ea.wepromote001@gmail.com" },
  });

  if (!shootCoordinator) {
    throw new Error("Shoot coordinator not found");
  }

  const shootWorkspace = await prisma.shootWorkspace.upsert({
    where: { id: "SHOOT-WORKSPACE-001" },
    update: {
      name: "Social Media Shoot Workspace",
      description: "Workspace for social media shoot planning and execution.",
      createdById: shootWorkspaceOwner.id,
    },
    create: {
      id: "SHOOT-WORKSPACE-001",
      name: "Social Media Shoot Workspace",
      description: "Workspace for social media shoot planning and execution.",
      createdById: shootWorkspaceOwner.id,
    },
  });

  await prisma.shootWorkspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: shootWorkspace.id,
        userId: shootWorkspaceOwner.id,
      },
    },
    update: {},
    create: {
      workspaceId: shootWorkspace.id,
      userId: shootWorkspaceOwner.id,
    },
  });

  await prisma.shootWorkspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: shootWorkspace.id,
        userId: shootCoordinator.id,
      },
    },
    update: {},
    create: {
      workspaceId: shootWorkspace.id,
      userId: shootCoordinator.id,
    },
  });

  const shootTask = await prisma.shootTask.upsert({
    where: { id: "SHOOT-TASK-001" },
    update: {
      title: "Social Media Shoot Plan",
      description: "Create and organize shoot assets for the upcoming campaign.",
      noOfPics: 6,
      noOfReels: 2,
      workspaceId: shootWorkspace.id,
      createdById: shootWorkspaceOwner.id,
    },
    create: {
      id: "SHOOT-TASK-001",
      workspaceId: shootWorkspace.id,
      title: "Social Media Shoot Plan",
      description: "Create and organize shoot assets for the upcoming campaign.",
      noOfPics: 6,
      noOfReels: 2,
      createdById: shootWorkspaceOwner.id,
    },
  });

  await prisma.shootSubTask.upsert({
    where: { id: "SHOOT-SUBTASK-001" },
    update: {
      title: "Capture product photos",
      description: "Shoot product stills with branded setup.",
      type: "PIC",
      referenceLinks: ["https://example.com/reference/product-photos"],
      videoType: "HORIZONTAL",
      setupType: "PREMIUM",
      submissionLinks: [],
      unableToSubmitReason: null,
      submittedById: null,
      submittedAt: null,
      taskId: shootTask.id,
    },
    create: {
      id: "SHOOT-SUBTASK-001",
      taskId: shootTask.id,
      title: "Capture product photos",
      description: "Shoot product stills with branded setup.",
      type: "PIC",
      referenceLinks: ["https://example.com/reference/product-photos"],
      videoType: "HORIZONTAL",
      setupType: "PREMIUM",
      submissionLinks: [],
      unableToSubmitReason: null,
      submittedById: null,
      submittedAt: null,
    },
  });

  await prisma.shootSubTask.upsert({
    where: { id: "SHOOT-SUBTASK-002" },
    update: {
      title: "Film Instagram Reel",
      description: "Record a vertical product reel for social media.",
      type: "REEL",
      referenceLinks: ["https://example.com/reference/instagram-reel"],
      videoType: "VERTICAL",
      setupType: "PHONE",
      submissionLinks: [],
      unableToSubmitReason: null,
      submittedById: null,
      submittedAt: null,
      taskId: shootTask.id,
    },
    create: {
      id: "SHOOT-SUBTASK-002",
      taskId: shootTask.id,
      title: "Film Instagram Reel",
      description: "Record a vertical product reel for social media.",
      type: "REEL",
      referenceLinks: ["https://example.com/reference/instagram-reel"],
      videoType: "VERTICAL",
      setupType: "PHONE",
      submissionLinks: [],
      unableToSubmitReason: null,
      submittedById: null,
      submittedAt: null,
    },
  });

  console.log("🌱 Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });