import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const user = await this.userService.create({ ...dto, role: "admin" });
      const token = this.signToken(user.id, user.email, user.role);
      return {
        message: "Registration successful",
        data: {
          token,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (err) {
      this.logger.error("register failed", err as any);
      throw err;
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.userService.findByEmail(dto.email);
      if (!user) throw new UnauthorizedException("Invalid credentials");

      const valid = await bcrypt.compare(dto.password, user.password);
      if (!valid) throw new UnauthorizedException("Invalid credentials");

      const token = this.signToken(user.id, user.email, user.role);
      return {
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error("login failed", err as any);
      throw new InternalServerErrorException("Login failed");
    }
  }

  private signToken(sub: string, email: string, role: "user" | "admin") {
    try {
      return this.jwtService.sign({ sub, email, role });
    } catch (err) {
      this.logger.error("signToken failed", err as any);
      throw new InternalServerErrorException("Token generation failed");
    }
  }
}
