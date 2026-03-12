import { Pool, Client } from 'pg';
import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const dbConfig = {
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'sigadbp_bd',
  password: process.env.PG_PASSWORD || '1114',
  port: process.env.PG_PORT || 5432,
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

      console.log('[DB] Restaurando sigadbp_backup.sql vía consola (psql)...');
      
      const backupPath = fileURLToPath(new URL('./sigadbp_backup.sql', import.meta.url));

      const psqlCommand = `psql -U ${dbConfig.user} -h ${dbConfig.host} -p ${dbConfig.port} -d ${dbConfig.database} -f "${backupPath}"`;

      await execAsync(psqlCommand, {
        env: {
          ...process.env,
          PGPASSWORD: dbConfig.password
        }
      });

      console.log('[DB] Backup restaurado correctamente con éxito.');
    } else {
        console.log(`[DB] La base de datos '${dbConfig.database}' ya existe. Omitiendo creación.`);
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
    console.log(' -> Base de datos lista y conectada.');
    release();
  });
});

export default pool;