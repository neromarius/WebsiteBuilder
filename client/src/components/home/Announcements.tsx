import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { BellRing, Calendar, Newspaper, Building } from "lucide-react";

export default function Announcements() {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        {/* Important Announcement */}
        <div className="bg-[#CE1126] text-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-start gap-4">
            <div className="text-2xl mt-1">
              <BellRing />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Anunț Important</h3>
              <p className="mb-2">
                Primăria Roeselare organizează o sesiune informativă pentru comunitatea 
                românească pe data de 15 Noiembrie 2023, ora 18:00.
              </p>
              <Link href="/evenimente">
                <a className="inline-block font-medium underline hover:text-secondary">
                  Citește mai mult
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Links Card 1 - Events */}
          <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl mr-4">
                  <Calendar />
                </div>
                <h3 className="text-xl font-bold">Evenimente viitoare</h3>
              </div>
              
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span>Petrecere de Crăciun</span>
                  <span className="text-neutral-dark">20 Dec</span>
                </li>
                <li className="flex justify-between">
                  <span>Târg tradițional</span>
                  <span className="text-neutral-dark">5 Nov</span>
                </li>
                <li className="flex justify-between">
                  <span>Seminar de integrare</span>
                  <span className="text-neutral-dark">12 Nov</span>
                </li>
              </ul>
              
              <Link href="/evenimente">
                <a className="inline-block mt-4 text-primary font-medium hover:underline">
                  Vezi toate evenimentele →
                </a>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Links Card 2 - News */}
          <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl mr-4">
                  <Newspaper />
                </div>
                <h3 className="text-xl font-bold">Știri recente</h3>
              </div>
              
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span>Noi oportunități de muncă în Antwerp</span>
                  <span className="text-neutral-dark">Azi</span>
                </li>
                <li className="flex justify-between">
                  <span>Modificări în legislația muncii din Belgia</span>
                  <span className="text-neutral-dark">Ieri</span>
                </li>
                <li className="flex justify-between">
                  <span>Festivalul românesc a atras peste 5000 de vizitatori</span>
                  <span className="text-neutral-dark">2d</span>
                </li>
              </ul>
              
              <Link href="/stiri">
                <a className="inline-block mt-4 text-primary font-medium hover:underline">
                  Citește toate știrile →
                </a>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Links Card 3 - Primăria Roeselare */}
          <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl mr-4">
                  <Building />
                </div>
                <h3 className="text-xl font-bold">Primăria Roeselare</h3>
              </div>
              
              <p className="mb-4">Informații utile despre serviciile primăriei, program și acte necesare.</p>
              
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <i className="fas fa-clock text-primary mr-2"></i>
                  <span>Luni-Vineri: 9:00-17:00</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone text-primary mr-2"></i>
                  <span>+32 51 26 21 11</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                  <span>Botermarkt 2, 8800 Roeselare</span>
                </li>
              </ul>
              
              <a 
                href="https://www.roeselare.be/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-primary font-medium hover:underline"
              >
                Vizitează site-ul oficial →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
