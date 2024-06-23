import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import bodyParser from 'body-parser';
import quoteRoutes from './routes/quote';


const app: Application = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/quote', quoteRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
