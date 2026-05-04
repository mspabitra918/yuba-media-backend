import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly logger;
    constructor(userService: UserService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        data: {
            token: string;
            user: {
                id: string;
                full_name: string;
                email: string;
                role: "user" | "admin";
            };
        };
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        data: {
            token: string;
            user: {
                id: string;
                full_name: string;
                email: string;
                role: "user" | "admin";
            };
        };
    }>;
    private signToken;
}
