const fs = require('fs');
const path = require('path');
const dotenv = require('../backend/node_modules/dotenv');

// Load environment from backend/.env if available
const backendEnvPath = path.resolve(__dirname, '../backend/.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else {
  dotenv.config();
}

let mysql;
try {
  mysql = require('../backend/node_modules/mysql2/promise');
} catch {
  mysql = require('mysql2/promise');
}

async function run() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '3306');
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'medichain';

  console.log(`Connecting to MySQL on ${dbHost}:${dbPort} as '${dbUser}'...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true,
    });
    console.log(`✅ Connected to MySQL successfully.`);
  } catch (err) {
    console.error(`❌ Connection failed (${err.code}): ${err.message}`);
    console.error(`\nPlease configure your MySQL credentials in backend/.env:`);
    console.error(`DB_USER=${dbUser}`);
    console.error(`DB_PASSWORD=your_actual_mysql_password`);
    process.exit(1);
  }

  try {
    console.log(`\n1. Recreating database '${dbName}'...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
    await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log('2. Executing schema.sql (tables, indexes, foreign keys)...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8').replace(/^\uFEFF/, '');
    await connection.query(schemaSql);
    console.log('✅ Schema migration completed.');

    console.log('3. Executing seed.sql (demo users, doctors, hospitals, patients, records)...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8').replace(/^\uFEFF/, '');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query(seedSql);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Demo seed data imported.');

    console.log('\n🎉 Database setup complete and ready for MediChain application!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();
