require('dotenv').config();

const url = process.env.DATABASE_URL;

const base = url
  ? {
      url,
      dialect: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'yuba_media',
      dialect: 'postgres',
    };

module.exports = {
  development: base,
  test: base,
  production: base,
};
