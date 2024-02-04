import express from 'express';
import cors from 'cors';
import { PORT,SECRET_KEY } from './config.js';

import getRoutes from './routes/getRoutes.js';
import postRoutes from './routes/postRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/', getRoutes); // Mount all GET routes directly
app.use('/', postRoutes); // Mount all POST routes directly

app.listen(PORT , "0.0.0.0");

