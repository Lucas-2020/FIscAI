require('dotenv').config({ path: '.env' });

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_TABLE,
      port: process.env.DB_PORT || 5432
    },
    migrations: {
      directory: "./migrations"
    },
    pool: {
      min: 0,
      max: 10
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_TABLE,
      port: process.env.DB_PORT || 5432
    },
    migrations: {
      directory: "./migrations"
    },
    pool: {
      min: 0,
      max: 10
    }
  }
};
