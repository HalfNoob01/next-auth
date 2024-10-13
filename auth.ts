import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import  { PrismaAdapter } from "@auth/prisma-adapter"
import { getUserById } from "./data/user"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import { getTwoFactorConfirmationUserId } from "./data/two-factor-confirmation";
import { getAccontByUserId } from "./data/account"

export const { handlers: { GET,POST }, auth, signIn,signOut } = NextAuth({ 
   pages: {
    signIn : "/auth/login",
    error : "/auth/error"
   },
   events : {
      async linkAccount({ user }) {
         await db.user.update({
            where : { id : user.id },
            data : { emailVerified : new Date() }
         })
      }
   } ,
   callbacks: {
      async signIn({ user, account}) {
         // Allow OAuth without email verification
         if(account?.provider !== "credentials") return true;
          
          const existingUser = await getUserById(user.id as string);
           
          // Prevent signIn without email verifaction
          if(!existingUser?.emailVerified) return true;
          
          if (existingUser.isTwoFactorEnabled) {
             const twoFactorConfirmation = await getTwoFactorConfirmationUserId(existingUser.id);
        
             if(!twoFactorConfirmation) return false;

            // Delete two factor confirmation for next sign in
             await db.twoFactorConfirmation.delete({
               where : { id: twoFactorConfirmation.id }
             });
          }

          return true
            
      },
       async session({ token, session }) {

             if(token.sub && session.user) {
                session.user.id = token.sub;
             }
            
             if(token.role && session.user) {
               session.user.role = token.role as UserRole
             }

             if(session.user) {
               session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
             }
             if(session.user) {
               session.user.name = token.name;
               session.user.email = token.email as string;
               session.user.isOAuth = token.isOAuth as boolean;
             }

             return session
       },
       async jwt({ token }) {
 
         if (!token.sub) return token;

         const existingUser = await getUserById(token.sub);

         if(!existingUser) return token;
         
         const existingAccount = await getAccontByUserId(
            existingUser.id
         );

         token.isOAuth = !!existingAccount;
         token.name = existingUser.name;
         token.email = existingUser.email
         token.role = existingUser.role;
         token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

         return token
       }
    },
    adapter : PrismaAdapter(db),
    session : { strategy : 'jwt'},
     ...authConfig
})