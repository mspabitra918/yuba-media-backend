import { User } from "./entities/user.entity";
export interface CreateUserInput {
    full_name: string;
    email: string;
    password: string;
    role?: "user" | "admin";
}
export declare class UserService {
    private readonly userModel;
    private readonly logger;
    constructor(userModel: typeof User);
    create(input: CreateUserInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User>;
}
