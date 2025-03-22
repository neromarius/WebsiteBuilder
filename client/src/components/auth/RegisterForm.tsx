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
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Numele de utilizator trebuie să conțină cel puțin 3 caractere.",
  }),
  email: z.string().email({
    message: "Te rugăm să introduci o adresă de email validă.",
  }),
  password: z.string().min(6, {
    message: "Parola trebuie să conțină cel puțin 6 caractere.",
  }),
  confirmPassword: z.string(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Trebuie să accepți termenii și condițiile.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolele nu coincid.",
  path: ["confirmPassword"],
});

export default function RegisterForm() {
  const [_, setLocation] = useLocation();
  const { register, isPending } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phoneNumber: "",
      location: "",
      termsAccepted: false,
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { confirmPassword, termsAccepted, ...userData } = values;
    
    try {
      await register(userData);
      setLocation("/");
    } catch (error) {
      // Error handling is done in the AuthContext
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Creează un cont</CardTitle>
        <CardDescription>
          Înregistrează-te pentru a te alătura comunității românilor din Belgia
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume de utilizator</FormLabel>
                  <FormControl>
                    <Input placeholder="Alege un nume de utilizator" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="exemplu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parolă</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Minim 6 caractere" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmă parola</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirmă parola" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume complet (opțional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nume și prenume" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon (opțional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+32 XXX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localitate (opțional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bruxelles" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-2 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel className="text-sm font-normal">
                      Sunt de acord cu{' '}
                      <a href="#" className="text-primary hover:underline">
                        termenii și condițiile
                      </a>{' '}
                      și{' '}
                      <a href="#" className="text-primary hover:underline">
                        politica de confidențialitate
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={isPending}
            >
              {isPending ? "Se procesează..." : "Înregistrare"}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-center">
        <div className="text-sm text-neutral-dark">
          Ai deja un cont?{" "}
          <Link href="/auth/login">
            <a className="text-primary font-medium hover:underline">
              Autentifică-te
            </a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
