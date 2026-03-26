import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { env } from './config/env.js';

const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api', routes);
app.use(errorMiddleware);

export default app;
