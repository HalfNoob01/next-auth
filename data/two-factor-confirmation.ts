import { db  } from "@/lib/db";

export const getTwoFactorConfirmationUserId = async ( userId : string ) => {
     try {
        const twoFactorCofirmation = await db.twoFactorConfirmation.findUnique({
            where : { userId }
        })

        return twoFactorCofirmation
        
     } catch {
        return null
     }
} 