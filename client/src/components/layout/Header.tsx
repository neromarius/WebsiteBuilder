import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateInitials } from "@/lib/utils";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  const navItems = [
    { path: "/", label: "Acasă" },
    { path: "/servicii", label: "Servicii" },
    { path: "/chat", label: "Chat" },
    { path: "/evenimente", label: "Evenimente" },
    { path: "/stiri", label: "Știri" },
  ];
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center px-4 py-3 md:py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="font-poppins font-bold text-xl md:text-2xl text-primary">Români în Belgia</h1>
                <p className="text-xs text-neutral-dark font-medium hidden md:block">Comunitatea noastră</p>
              </div>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a 
                  className={`px-3 py-2 font-medium rounded-md transition-colors ${
                    location === item.path 
                      ? "text-primary bg-primary/5" 
                      : "text-neutral-dark hover:bg-primary hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={user?.profileImage} 
                        alt={user?.fullName || user?.username} 
                      />
                      <AvatarFallback>{generateInitials(user?.fullName || user?.username || '')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profil">
                      <a className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profilul meu</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profil/setari">
                      <a className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Setări</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Deconectare</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button className="hidden md:block bg-secondary text-primary font-bold hover:bg-secondary/90">
                    Înregistrare
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-primary text-primary font-bold hover:bg-primary hover:text-white">
                    Autentificare
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-neutral-dark p-2 focus:outline-none" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden bg-white px-4 py-3 shadow-inner ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a 
                  className={`px-3 py-2 font-medium rounded-md transition-colors ${
                    location === item.path 
                      ? "text-primary" 
                      : "text-neutral-dark hover:bg-primary hover:text-white"
                  }`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            
            {!isAuthenticated && (
              <Link href="/auth/register">
                <a 
                  className="px-3 py-2 bg-secondary text-center text-primary font-bold rounded-md"
                  onClick={closeMobileMenu}
                >
                  Înregistrare
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
