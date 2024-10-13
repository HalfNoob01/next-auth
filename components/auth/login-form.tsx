"use client"
import {  useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { CardWrapper } from "./card-wrapper"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { LoginSchema } from "@/schemas"
import { Form,FormControl,FormField,FormItem, FormLabel, FormMessage}  from "@/components/ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { FormError } from "../form-error"
import { FormSuccess } from "../form-success"
import { login } from "@/actions/login"
import Link from "next/link"

export const LoginForm = () => {
   const searchParams = useSearchParams();
   const callbacUrl = searchParams.get("callbackUrl")
   const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
    ? "Email already in use with different providers!" : "" ;

  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [error, setError] = useState<string | undefined>("") 
  const [success,setSuccess] =useState<string | undefined>("")
  const [isPending,startTransition ] = useTransition()
  
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver : zodResolver (LoginSchema),
    defaultValues: {
      email : "",
      password : "",
      code : ""
    }
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")

     startTransition(()=>{
       login(values,callbacUrl)
        .then((data)=>{
          if(data?.error) {
            // form.reset();
            setError(data.error);
            form.setValue("code", ""); 
          }

          if(data?.success) {
            form.reset();
            setSuccess(data.success)
            setShowTwoFactor(false); 
          }

          if(data?.twoFactor) {
            setShowTwoFactor(true)
          }
        })
        .catch(()=> setError("Someting went wrong!"))
     })

    }
     
  
  return (
    <CardWrapper headerLabel="Welcome back" backButtonLabel="Don't have an account"
     backButtonHref="/auth/register" showSocial
    >
     <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            
            {showTwoFactor && (
                <FormField control={form.control} name="code" render={({field}) =>(
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input {...field } disabled={isPending}  placeholder="123456" />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
       ) }/>    
            )}

            {!showTwoFactor && (
              <>
            <FormField control={form.control} name="email" render={({field}) =>(
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field } disabled={isPending}  placeholder="johndoe@example.com" type="email"/>
                </FormControl>
                <FormMessage/>
              </FormItem>
   ) }/>    

     <FormField control={form.control} name="password" render={({field}) =>(
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field } disabled={isPending}  placeholder="*****" type="password" autoComplete="current password"/>
                </FormControl>
                
                <Button size="sm" variant="link" asChild className="px-0 font-normal">
                  <Link href="/auth/reset">
                    forget password?
                  </Link>
                </Button>
                 
                <FormMessage/>
              </FormItem>
            ) }/> 
          </>
            )}
          </div>
           
           <FormError message={error || urlError}/>
           <FormSuccess message={success}/>
          <Button type="submit" className="w-full" disabled={isPending}>
           { showTwoFactor ? "Confirm" : "Login"}
          </Button>
       </form>
     </Form>
    </CardWrapper>
  )
}

