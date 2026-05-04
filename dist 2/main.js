"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const logger = new common_1.Logger("Bootstrap");
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors({
            origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }));
        const config = new swagger_1.DocumentBuilder()
            .setTitle("API Docs")
            .setDescription("API description")
            .setVersion("1.0")
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup("api-docs", app, document);
        const port = Number(process.env.PORT) || 4000;
        await app.listen(port);
        logger.log(`Yuba Media API running at http://localhost:${port}/api-docs`);
    }
    catch (err) {
        logger.error("Failed to start application", err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map