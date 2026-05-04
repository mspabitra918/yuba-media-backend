import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
export interface JwtPayload {
    sub: string;
    email: string;
    role: "user" | "admin";
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => InstanceType<typeof Strategy> & {
    validate(...args: any[]): unknown | Promise<unknown>;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): {
        id: string;
        email: string;
        role: "user" | "admin";
    };
}
export {};
