import { SequelizeModuleOptions } from "@nestjs/sequelize";

export const databaseConfig = (): SequelizeModuleOptions => {
  const url = process.env.DATABASE_URL;
  const common = {
    dialect: "postgres" as const,
    autoLoadModels: true,
    synchronize: process.env.DB_SYNC === "true",
    logging: false,
  };

  if (url) {
    return {
      ...common,
      uri: url,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    };
  }

  return {
    ...common,
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "yuba_media",
  };
};
