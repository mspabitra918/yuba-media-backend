import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    me(user: any): Promise<{
        message: string;
        data: any;
    }>;
}
