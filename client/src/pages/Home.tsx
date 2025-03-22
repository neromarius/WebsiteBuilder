import Hero from "@/components/home/Hero";
import Announcements from "@/components/home/Announcements";
import Services from "@/components/home/Services";
import Chat from "@/components/home/Chat";
import Events from "@/components/home/Events";
import NewsSection from "@/components/home/News";
import AppPromotion from "@/components/home/AppPromotion";
import CallToAction from "@/components/home/CallToAction";

export default function Home() {
  return (
    <>
      <Hero />
      <Announcements />
      <Services />
      <Chat showFullChat={false} />
      <Events />
      <NewsSection />
      <AppPromotion />
      <CallToAction />
    </>
  );
}
