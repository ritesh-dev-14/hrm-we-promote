const fs = require('fs');
const filePath = 'f:/We Promote Frontend ok/hrm-frontend-main/src/routes/AppRoutes.jsx';
let content = fs.readFileSync(filePath, 'utf8');

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

if (!content.includes('path="/daily-reports"')) {
   // Replace right before the final </Routes> tag
   content = content.replace('</Routes>', routeStr + '\n</Routes>');
   fs.writeFileSync(filePath, content);
   console.log('AppRoutes patched via last route');
} else {
   console.log('Already there');
}
