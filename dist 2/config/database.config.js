"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const databaseConfig = () => ({
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "yuba_media",
    autoLoadModels: true,
    synchronize: process.env.DB_SYNC === "true",
    logging: false,
});
exports.databaseConfig = databaseConfig;
//# sourceMappingURL=database.config.js.map