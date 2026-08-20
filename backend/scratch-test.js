const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a test HR token
const token = jwt.sign({ id: 'dummy', role: 'HR' }, process.env.JWT_SECRET || 'secret');

async function test() {
  try {
    const res = await axios.get('http://localhost:8000/api/daily-report?date=2026-08-19', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
}
test();
