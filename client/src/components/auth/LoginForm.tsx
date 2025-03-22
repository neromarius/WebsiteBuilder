import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Numele de utilizator trebuie să conțină cel puțin 3 caractere.",
  }),
  password: z.string().min(6, {
    message: "Parola trebuie să conțină cel puțin 6 caractere.",
  }),
});

export default function LoginForm() {
  const [_, setLocation] = useLocation();
  const { login, isPending } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await login(values.username, values.password);
      setLocation("/");
    } catch (error) {
      // Error handling is done in the AuthContext
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Autentificare</CardTitle>
        <CardDescription>
          Introdu datele de conectare pentru a-ți accesa contul
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume de utilizator</FormLabel>
                  <FormControl>
                    <Input placeholder="Introdu numele tău de utilizator" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parolă</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Introdu parola" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending}
            >
              {isPending ? "Se procesează..." : "Autentificare"}
            </Button>
          </form>
        </Form>
        
        <div className="text-center mt-4">
          <a href="#" className="text-sm text-primary hover:underline">
            Ai uitat parola?
          </a>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-center">
        <div className="text-sm text-neutral-dark">
          Nu ai un cont încă?{" "}
          <Link href="/auth/register">
            <a className="text-primary font-medium hover:underline">
              Înregistrează-te
            </a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
