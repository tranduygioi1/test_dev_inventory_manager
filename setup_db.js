const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  // Connect to default 'postgres' database
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // connect to default db first
  });

  try {
    await client.connect();

    // Check if database exists
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'inventory_db'`);
    if (res.rowCount === 0) {
      console.log('Creating database inventory_db...');
      await client.query(`CREATE DATABASE inventory_db`);
      console.log('Database inventory_db created successfully.');
    } else {
      console.log('Database inventory_db already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }

  // Connect to the newly created database and run schema
  const dbClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'inventory_db',
  });

  try {
    await dbClient.connect();
    const schemaSql = fs.readFileSync(path.join(__dirname, 'src', 'db', 'schema.sql'), 'utf-8');
    console.log('Applying schema.sql...');
    await dbClient.query(schemaSql);
    console.log('Tables created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await dbClient.end();
  }
}

setup();
