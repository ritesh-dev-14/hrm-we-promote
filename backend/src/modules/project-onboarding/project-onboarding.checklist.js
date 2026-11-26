const COMMON_ITEMS = [
  { key: "project-entry", label: "Project create entry", dueDays: 4 },
  { key: "project-info", label: "Project information filled", dueDays: 4 },
  { key: "whatsapp-group", label: "WhatsApp group created", dueDays: 4 },
  { key: "credentials", label: "Credentials filled", dueDays: 4 },
];

const DEPARTMENT_ITEMS = {
  social: [
    { key: "content-calendar", label: "Content calendar created", dueDays: 7 },
    { key: "shoot-planned", label: "Shoot planned", dueDays: 7 },
  ],
  marketing: [
    { key: "funds-added", label: "Funds added", dueDays: 7 },
    { key: "campaign-running", label: "Campaign running", dueDays: 7 },
  ],
  seo: [
    { key: "keywords-planned", label: "Keywords planned", dueDays: 7 },
    { key: "keywords-shared", label: "Keywords shared with client", dueDays: 7 },
    { key: "seo-started", label: "SEO started", dueDays: 7 },
  ],
};

const getDepartmentKey = (departmentName = "") => {
  const department = String(departmentName).toLowerCase();
  if (department.includes("social")) return "social";
  if (department.includes("seo")) return "seo";
  if (department.includes("marketing") || department.includes("meta")) return "marketing";
  return null;
};

const getChecklistItems = (departmentName) => {
  const departmentKey = getDepartmentKey(departmentName);
  if (!departmentKey) return [];
  return [...COMMON_ITEMS, ...DEPARTMENT_ITEMS[departmentKey]];
};

module.exports = { getChecklistItems };
