import { Model } from "sequelize-typescript";
export declare class User extends Model<User> {
    id: string;
    full_name: string;
    email: string;
    password: string;
    role: "user" | "admin";
}
