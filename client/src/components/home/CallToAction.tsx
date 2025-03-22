import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function CallToAction() {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-6">
          Fii parte din comunitatea noastră
        </h2>
        <p className="text-lg text-neutral-dark max-w-2xl mx-auto mb-8">
          Înscrie-te acum pentru a te conecta cu alți români din Belgia, pentru a 
          accesa servicii, evenimente și informații utile.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link href="/servicii">
                <Button className="px-8 py-6 bg-primary text-white font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300 text-lg">
                  Explorează Servicii
                </Button>
              </Link>
              <Link href="/profil">
                <Button variant="outline" className="px-8 py-6 border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white text-lg">
                  Profilul Meu
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/register">
                <Button className="px-8 py-6 bg-primary text-white font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300 text-lg">
                  Creează un cont
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="px-8 py-6 border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white text-lg">
                  Află mai multe
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
