import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Service, Event } from "@shared/schema";
import { generateInitials, formatDate } from "@/lib/utils";
import { User, Settings, LogOut, MapPin, Mail, Phone, Award, Star } from "lucide-react";
import ServiceCard from "@/components/services/ServiceCard";
import EventCard from "@/components/events/EventCard";

// Form schema for profile updates
const profileFormSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email({
    message: "Te rugăm să introduci o adresă de email validă.",
  }),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  about: z.string().optional(),
  profileImage: z.string().optional(),
});

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get user's services
  const { data: userServices, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services/user'],
    enabled: !!user,
  });
  
  // Get user's events
  const { data: userEvents, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/user'],
    enabled: !!user,
  });
  
  // Form for profile updates
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      location: user?.location || "",
      about: user?.about || "",
      profileImage: user?.profileImage || "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileFormSchema>) => {
      const res = await apiRequest('PATCH', '/api/users/profile', values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Profil actualizat",
        description: "Profilul tău a fost actualizat cu succes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut actualiza profilul. Încearcă din nou.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(values);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Trebuie să fii autentificat</h2>
        <p className="mb-6">Pentru a accesa profilul trebuie să te autentifici.</p>
        <div className="flex justify-center gap-4">
          <a href="/auth/login" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            Autentificare
          </a>
          <a href="/auth/register" className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors">
            Înregistrare
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.profileImage} alt={user.username} />
            <AvatarFallback className="text-2xl">{generateInitials(user.fullName || user.username)}</AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-3xl font-bold">{user.fullName || user.username}</h1>
            <p className="text-gray-600">@{user.username}</p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {user.isAdmin && <Badge className="bg-red-500">Administrator</Badge>}
              {user.isModerator && <Badge className="bg-blue-500">Moderator</Badge>}
              {user.isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary">
                  Premium
                </Badge>
              )}
              <Badge variant="outline">Membru din {formatDate(user.createdAt)}</Badge>
            </div>
          </div>
          
          <div className="ml-auto mt-4 md:mt-0">
            <Button variant="outline" className="mr-2" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Deconectare
            </Button>
          </div>
        </div>
      </div>
      
      {/* Profile content */}
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" /> Profil
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center">
            <Star className="mr-2 h-4 w-4" /> Serviciile mele
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center">
            <Award className="mr-2 h-4 w-4" /> Evenimentele mele
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" /> Setări
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Despre mine</CardTitle>
                  <CardDescription>
                    Informații personale și de contact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.about ? (
                    <div className="mb-6 prose max-w-none">
                      <p className="whitespace-pre-line">{user.about}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mb-6">
                      Nu ai adăugat încă informații despre tine. Editează profilul pentru a adăuga.
                    </p>
                  )}
                  
                  <div className="space-y-4">
                    {user.location && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <p className="font-medium">Locație</p>
                          <p>{user.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.phoneNumber && (
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <p className="font-medium">Telefon</p>
                          <p>{user.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p>{user.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Statistici</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Servicii:</span>
                      <Badge variant="outline">{userServices?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Evenimente:</span>
                      <Badge variant="outline">{userEvents?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Puncte:</span>
                      <Badge variant="outline">{user.points || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Insigne:</span>
                      <Badge variant="outline">{user.badges?.length || 0}</Badge>
                    </div>
                  </div>
                  
                  {user.badges && user.badges.length > 0 && (
                    <div className="mt-6">
                      <p className="font-medium mb-2">Insigne</p>
                      <div className="flex flex-wrap gap-2">
                        {user.badges.map((badge, index) => (
                          <Badge key={index} variant="secondary">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {user.isPremium ? (
                <Card className="mt-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-500 mr-2" />
                      Membru Premium
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">
                      Beneficiezi de toate avantajele contului premium!
                    </p>
                    <ul className="text-sm list-disc list-inside space-y-1 text-gray-700">
                      <li>Evidențierea serviciilor și evenimentelor</li>
                      <li>Imagini multiple pentru servicii</li>
                      <li>Statistici detaliate și rapoarte</li>
                      <li>Programări și calendar avansat</li>
                      <li>Și multe altele...</li>
                    </ul>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Activează Premium</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Obține acces la funcționalități avansate pentru serviciile și evenimentele tale.
                    </p>
                    <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary hover:from-yellow-500 hover:to-yellow-600">
                      Activează acum
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Serviciile mele</CardTitle>
                    <CardDescription>
                      Serviciile pe care le-ai adăugat în platformă
                    </CardDescription>
                  </div>
                  <Button>Adaugă serviciu</Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {servicesLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-md animate-pulse"></div>
                      ))}
                    </div>
                  ) : !userServices || userServices.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Nu ai adăugat niciun serviciu încă.
                      </p>
                      <Button>Adaugă primul tău serviciu</Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userServices.map(service => (
                        <ServiceCard key={service.id} service={service} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Statistici Servicii</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total servicii:</span>
                      <Badge variant="outline">{userServices?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Servicii premium:</span>
                      <Badge variant="outline">
                        {userServices?.filter(s => s.isPremium).length || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Vizualizări totale:</span>
                      <Badge variant="outline">0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Contactări:</span>
                      <Badge variant="outline">0</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Promovează serviciile</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Serviciile premium apar în partea de sus a rezultatelor și au funcționalități avansate.
                  </p>
                  <Button className="w-full">
                    Obține Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="events">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Evenimentele mele</CardTitle>
                    <CardDescription>
                      Evenimentele pe care le-ai organizat
                    </CardDescription>
                  </div>
                  <Button>Adaugă eveniment</Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {eventsLoading ? (
                    <div className="space-y-4">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-md animate-pulse"></div>
                      ))}
                    </div>
                  ) : !userEvents || userEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Nu ai organizat niciun eveniment încă.
                      </p>
                      <Button>Organizează primul tău eveniment</Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userEvents.map(event => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Statistici Evenimente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total evenimente:</span>
                      <Badge variant="outline">{userEvents?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Participanți totali:</span>
                      <Badge variant="outline">
                        {userEvents?.reduce((acc, ev) => acc + (ev.participantCount || 0), 0) || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Vizualizări totale:</span>
                      <Badge variant="outline">0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Evenimente viitoare:</span>
                      <Badge variant="outline">
                        {userEvents?.filter(ev => new Date(ev.date) > new Date()).length || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Promovează evenimentele</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Obține mai multă vizibilitate pentru evenimentele tale cu opțiunile premium.
                  </p>
                  <Button className="w-full">
                    Află mai multe
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Editează profilul</CardTitle>
              <CardDescription>
                Actualizează informațiile tale personale și de contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nume complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Nume și prenume" {...field} />
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
                          <Input type="email" placeholder="email@exemplu.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
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
                          <FormLabel>Localitate</FormLabel>
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
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Despre mine</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Scrie câteva informații despre tine..." 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagine de profil</FormLabel>
                        <FormControl>
                          <Input placeholder="URL imagine" {...field} />
                        </FormControl>
                        <FormDescription>
                          Introdu URL-ul unei imagini pentru profilul tău
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Se salvează..." : "Salvează modificările"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Schimbă parola</CardTitle>
              <CardDescription>
                Actualizează parola contului tău
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Parola actuală</FormLabel>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <FormLabel>Parola nouă</FormLabel>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <FormLabel>Confirmă parola nouă</FormLabel>
                  <Input type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Schimbă parola</Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-8 border-red-100">
            <CardHeader>
              <CardTitle className="text-red-600">Șterge contul</CardTitle>
              <CardDescription>
                Odată șters, toate datele tale vor fi eliminate definitiv
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Această acțiune este ireversibilă. Toate serviciile, evenimentele și informațiile tale personale vor fi șterse.
              </p>
              <Button variant="destructive">Șterge contul</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
