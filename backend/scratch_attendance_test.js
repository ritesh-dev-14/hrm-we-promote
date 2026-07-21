const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getEmployeeAttendance } = require('./src/modules/attendance/attendance.service');

async function check() {
  try {
    // First find any employee that has an attendance record
    const record = await prisma.attendance.findFirst({
      include: { user: true }
    });
    
    if (record) {
      console.log(`Found employee: ${record.user.employeeId}`);
      const data = await getEmployeeAttendance(record.user.employeeId, {});
      console.log("Success! Data:", JSON.stringify(data, null, 2));
    } else {
      console.log("No attendance records found in DB to test with.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
