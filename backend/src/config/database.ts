import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medichain',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

export async function getConnection() {
  return pool.getConnection();
}

export async function query<T = mysql2.RowDataPacket[]>(
  sql: string,
  params?: any[]
): Promise<T> {
  const [rows] = await pool.execute(sql, params as any);
  return rows as T;
}

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  conn.release();
  console.log('✅ Database connected successfully');
}

export default pool;
