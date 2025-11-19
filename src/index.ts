import cors from 'cors';
import express from 'express';
import jobs from './core/jobs.js';
import database from './core/database.js';
import errors from './middlewares/errors.js';

const app = express();

database();

app.use(cors());
app.use(express.json());

app.get('/status', (req, res) => { res.status(200).end(); });
app.head('/status', (req, res) => { res.status(200).end(); });

app.use('/explorers', (await import('./routes/explorateurs.routes.js')).default);
app.use('/sessions', (await import('./routes/sessions.routes.js')).default);
app.use('/explorer', (await import('./routes/explorations.routes.js')).default);
app.use('/explorations', (await import('./routes/explorations.routes.js')).default);
app.use(errors);

export default app;