import NextAuth, { type DefaultSession } from "next-auth"
import { UserRole } from "@prisma/client";

export type ExtendUser =  DefaultSession["user"] & {
      role : UserRole;
      isTwoFactorEnabled : boolean;
      isOAuth : boolean;
};

declare module "next-auth" { 

    interface Session {
       user : ExtendUser
    }
 }

//  import { JWT } from "next-auth/jwt"
 
// declare module "next-auth/jwt" {
//   interface JWT {
//     role?: "ADMIN" | "USER"
//   }
