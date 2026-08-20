const fs = require('fs');
const filePath = 'f:/We Promote Frontend ok/hrm-frontend-main/src/routes/AppRoutes.jsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import DailyDepartmentReportPage')) {
  content = content.replace('import SEOProjectsPage', 'import DailyDepartmentReportPage from "../pages/DailyDepartmentReportPage";\nimport SEOProjectsPage');
}

if (!content.includes('path="/daily-reports"')) {
  const routeStr = `
          <Route
            path="/daily-reports"
            element={
              ["ADMIN", "HR", "EA", "MANAGER"].includes(role) ? (
                <DailyDepartmentReportPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
`;
  content = content.replace('<Route\n            path="/seo-projects"', routeStr + '<Route\n            path="/seo-projects"');
  
  // Try one-line version if the multi-line replace didn't hit
  if (!content.includes('path="/daily-reports"')) {
      content = content.replace('<Route path="/seo-projects"', routeStr + '<Route path="/seo-projects"');
  }
}

fs.writeFileSync(filePath, content);
console.log('AppRoutes patched successfully');
