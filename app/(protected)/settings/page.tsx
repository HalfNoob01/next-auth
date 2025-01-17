"use client";

import { useTransition, useState } from "react";
// import { auth, signOut } from "@/auth"
import { useSession } from "next-auth/react";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Select, SelectContent, SelectItem,
  SelectTrigger,SelectValue
} from "@/components/ui/select";

import {
   Card, CardHeader, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setting } from "@/actions/settings";

import { SettingsSchema } from "@/schemas";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage,
    FormControl
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";
import { UserRole } from "@prisma/client";
import { Switch } from "@/components/ui/switch";

const SettingsPage =  () => {
  const user = useCurrentUser();

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingsSchema>>({
     resolver : zodResolver(SettingsSchema),
     defaultValues : {
      name : user?.name || undefined,
      email : user?.email || undefined,
      password : undefined,
      newPassword : undefined,
      role : user?.role || undefined,
      isTwoFactorEnabled : user?.isTwoFactorEnabled || undefined
     }
  })

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(()=>{
      setting(values)
       .then((data)=>{
          if(data.error) {
            setError(data.error);
          }

          if(data.success) {
            setSuccess(data.success)
          }
       })
       .catch(() => setError("Something went wrong!"))
    })

  }
  return (
    <Card className="w-[600px] mb-2">
     <CardHeader>
      <p className="text-2xl font-semibold text-center">
      ⚙️ Settings
      </p>
     </CardHeader>

     <CardContent>
        <Form {...form}>
          <form className="space-y-6 " onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
              
              <FormField control={form.control} name="name"
               render={({field}) =>(
                 <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                  <Input {...field} placeholder="John Doe" disabled={isPending} autoComplete="name"/>
                  </FormControl>
                  <FormMessage/>
                 </FormItem>
               )}
              />
             {user?.isOAuth  === false && (
                   <>
                    <FormField control={form.control} name="email"
                      render={({field}) =>(
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                          <Input {...field} placeholder="john.doe@example.com" disabled={isPending} type="email" autoComplete="email"/>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                      />

                      <FormField control={form.control} name="password"
                      render={({field}) =>(
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                          <Input {...field} placeholder="123456" disabled={isPending} type="password" autoComplete="password" />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                      />

                    <FormField control={form.control} name="newPassword"
                      render={({field}) =>(
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                          <Input {...field} placeholder="123456" disabled={isPending} type="password" autoComplete="newPassword" />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                      />

                   </>
             )}
             
              <FormField control={form.control} name="role"
               render={({field}) =>(
                 <FormItem>
                  <FormLabel>Role</FormLabel>
                   <Select disabled={isPending} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role"/>
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>
                          Admin
                        </SelectItem>
                        <SelectItem value={UserRole.USER}>
                          User
                        </SelectItem>
                      </SelectContent>
                     </Select>
                     <FormMessage/>
                 </FormItem>
               )}
              />
             {user?.isOAuth  === false && (
              <FormField control={form.control} name="isTwoFactorEnabled"
               render={({field}) =>(
                 <FormItem className="flex flex-row items-center justify-between
                   rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Two Factor Authentication</FormLabel>
                        <FormDescription>
                          Enable Two factor authentication for yor account
                        </FormDescription>
                    </div>
                   <FormControl>
                     <Switch disabled={isPending} checked={field.value} 
                      onCheckedChange={field.onChange}
                     />
                       
                   </FormControl>
                 </FormItem>
               )}
              />

             )}

              </div>
              <FormSuccess message={success} />
              <FormError message={error} />
              <Button disabled={isPending} type="submit">
                Save
              </Button>
          </form>
        </Form>
     </CardContent>
    </Card>
  )
}

export default SettingsPage
