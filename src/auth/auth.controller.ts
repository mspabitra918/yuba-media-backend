import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";
import { RolesGuard } from "../common/guards/roles.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.authService.register(dto);
    } catch (err) {
      throw err;
    }
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (err) {
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: any) {
    try {
      return { message: "Current user", data: user };
    } catch (err) {
      throw err;
    }
  }
}
