"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";

export const newPassword = async (
     values : z.infer<typeof NewPasswordSchema>,
     token : string | null,

) => {
    if (!token) {
        return { error : "Missing token!"}
    }

    const vaildatedFields = NewPasswordSchema.safeParse(values);
    if(!vaildatedFields.success) {
        return { error: "Invalid fields!"};
    }

    const { password } =  vaildatedFields.data;

    const existingToken = await getPasswordResetTokenByToken(token);
    if(!existingToken) {
        return { error: "Invaild token!"}
    }

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) {
        return { error : "Token as expired!" }
    }
   
    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
        return { error: "Email does not exist!" }
    }
  
   const hashedPassword = await bcrypt.hash(password,10);

   await db.user.update({
        where : { id : existingUser.id },
        data : { password : hashedPassword }
   })

   await db.passwordResetToken.delete({
     where : { id: existingToken.id }
   })

   return { success : "Password updated!"}

}