import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-neutral-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Logo and About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white">
                <span className="text-primary font-bold text-xl">R</span>
              </div>
              <h2 className="font-poppins font-bold text-xl">Români în Belgia</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Conectăm comunitatea românească din Belgia, facilitând accesul la servicii, 
              evenimente și informații utile.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-secondary" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Navigare rapidă</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-white transition-colors">Acasă</a>
                </Link>
              </li>
              <li>
                <Link href="/servicii">
                  <a className="text-gray-400 hover:text-white transition-colors">Servicii</a>
                </Link>
              </li>
              <li>
                <Link href="/chat">
                  <a className="text-gray-400 hover:text-white transition-colors">Chat</a>
                </Link>
              </li>
              <li>
                <Link href="/evenimente">
                  <a className="text-gray-400 hover:text-white transition-colors">Evenimente</a>
                </Link>
              </li>
              <li>
                <Link href="/stiri">
                  <a className="text-gray-400 hover:text-white transition-colors">Știri</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div>
            <h3 className="text-lg font-bold mb-4">Comunitate</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Despre noi</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cum funcționează</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Abonament Premium</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Regulament</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Reclamații și sugestii</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-3 text-secondary"></i>
                <span className="text-gray-400">contact@romaniinbelgia.be</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-3 text-secondary"></i>
                <span className="text-gray-400">+32 XX XXX XXXX</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-secondary"></i>
                <span className="text-gray-400">Bruxelles, Belgia</span>
              </li>
            </ul>
            <div className="mt-4">
              <a 
                href="#" 
                className="inline-block px-4 py-2 bg-secondary text-primary font-bold rounded-md hover:bg-secondary/90 transition-colors"
              >
                Contactează-ne
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-700 text-center md:flex md:justify-between md:items-center">
          <p className="text-gray-400 mb-4 md:mb-0">© {new Date().getFullYear()} Români în Belgia. Toate drepturile rezervate.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Termeni și condiții</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Politica de confidențialitate</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Politica de cookie-uri</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
