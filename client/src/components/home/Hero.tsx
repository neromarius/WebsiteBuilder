import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative bg-primary text-white overflow-hidden" style={{ height: '85vh' }}>
      {/* Hero Background with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 parallax-bg" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1559682468-3c9a1edf4158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')` 
        }}
      ></div>

      {/* Content Container */}
      <div className="container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-4 leading-tight" 
              style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.7)' }}>
            Comunitatea românilor din Belgia
          </h1>
          <p className="text-lg md:text-xl mb-8 leading-relaxed">
            Conectăm românii din Belgia, oferind un spațiu virtual pentru servicii, 
            evenimente, știri și discuții. Fii parte din comunitatea noastră!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/register">
              <Button className="px-6 py-6 bg-secondary text-primary font-bold hover:bg-secondary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300">
                Înscrie-te acum
              </Button>
            </Link>
            <Link href="/servicii">
              <Button variant="outline" className="px-6 py-6 border-2 border-white text-white font-bold hover:bg-white hover:text-primary">
                Explorează servicii
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="absolute bottom-10 right-10 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-lg hidden md:block">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">2,500+</p>
              <p className="text-sm">Membri</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">450+</p>
              <p className="text-sm">Servicii</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">120+</p>
              <p className="text-sm">Evenimente/an</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-0 left-0 right-0 text-center scroll-indicator">
          <span className="text-sm font-medium">Scroll pentru mai multe</span>
        </div>
      </div>
    </section>
  );
}
