const express = require('express');
const app = express();
const port = process.env.USER_SERVICE_PORT || 3000;

app.get('/', (req, res) => {
  res.json({status: "success", code: 200, message: "User service is running"});
});

app.get('/health', (req, res) => {
  res.json({status: "success", code: 200, message: "Server is running"});
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});