import dotenv from 'dotenv';
import express from 'express';
import apiRouter from './routes/auth-routes.js';

dotenv.config({ path : '../../../.env' });

const app = express();
app.use(express.json());
const port = process.env.USER_SERVICE_PORT || 3000;

app.use(apiRouter);

// app.get('/health', (req, res) => {
//   res.json({status: "success", code: 200, message: "Server is running"});
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});