import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use('/api-sigadbp', router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`➜ Servidor funcionando en http://localhost:${port}`);
});