import { Pool, Client } from 'pg';
import 'dotenv/config';
import fs from 'fs';

const dbConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

const defaultClient = new Client({
  ...dbConfig,
  database: 'postgres',
});

const pool = new Pool(dbConfig);

const initDB = async () => {
  try {
    await defaultClient.connect();
    
    const res = await defaultClient.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname = $1`,
      [dbConfig.database]
    );

    if (res.rowCount === 0) {
      console.log(`[DB] La base de datos '${dbConfig.database}' no existe. Creándola...`);
      await defaultClient.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log(`[DB] Base de datos '${dbConfig.database}' creada exitosamente.`);
      const setupPool = new Pool(dbConfig);
      const sqlQuery = fs.readFileSync(new URL('./bd.sql', import.meta.url), 'utf8');
      console.log('[DB] Ejecutando bd.sql...');
      await setupPool.query(sqlQuery);
      console.log('[DB] Script bd.sql ejecutado correctamente.');
      await setupPool.end();
    }

  } catch (error) {
    console.error('[DB] Error en la inicialización:', error);
  } finally {
    await defaultClient.end();
  }
};

initDB().then(() => {
  pool.connect((error, client, release) => {
    if (error) {
      return console.error('[DB] Error adquiriendo cliente:', error.stack);
    }
    console.log('➜ Base de datos lista y conectada.');
    release();
  });
});

export default pool;