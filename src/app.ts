import express from 'express';
import { router } from './routes';
import { errorHandling } from './middlewares/error-handling';

const app = express();

app.use(express.json());
app.use(router);

app.use(errorHandling);

export { app };
