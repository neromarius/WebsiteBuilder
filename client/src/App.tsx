import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Chat from "@/pages/Chat";
import Events from "@/pages/Events";
import News from "@/pages/News";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import { AuthProvider } from "@/context/AuthContext";
import { WebSocketProvider } from "@/context/WebSocketContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RadioPlayer from "@/components/shared/RadioPlayer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/servicii" component={Services} />
          <Route path="/servicii/:id" component={ServiceDetail} />
          <Route path="/chat" component={Chat} />
          <Route path="/evenimente" component={Events} />
          <Route path="/stiri" component={News} />
          <Route path="/auth/:type" component={Auth} />
          <Route path="/profil" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <RadioPlayer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <Router />
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
