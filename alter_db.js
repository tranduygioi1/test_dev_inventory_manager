const { Client } = require('pg');
require('dotenv').config();

async function alterDB() {
  const dbClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'inventory_db',
  });

  try {
    await dbClient.connect();
    console.log('Adding debit and credit columns to receipts table...');
    await dbClient.query(`ALTER TABLE receipts ADD COLUMN IF NOT EXISTS debit VARCHAR(50)`);
    await dbClient.query(`ALTER TABLE receipts ADD COLUMN IF NOT EXISTS credit VARCHAR(50)`);
    console.log('Columns added successfully.');
  } catch (err) {
    console.error('Error altering table:', err);
  } finally {
    await dbClient.end();
  }
}

alterDB();
