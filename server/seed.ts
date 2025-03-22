import { db } from "./db";
import {
  users,
  services,
  chatMessages,
  events,
  eventParticipants,
  news
} from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Seed database with demo data for testing
 */
export async function seedDatabase() {
  try {
    console.log("Checking if seed data already exists...");
    
    // Check if we have users other than admin
    const existingUsers = await db.select().from(users).where(eq(users.username, "user1"));
    
    if (existingUsers.length > 0) {
      console.log("Seed data already exists, skipping seeding");
      return;
    }
    
    console.log("Seeding database with demo data...");
    
    // Create sample users
    const demoUsers = [
      {
        username: "user1",
        email: "user1@example.com",
        password: "password123", // In production, this would be hashed
        fullName: "Ion Popescu",
        phoneNumber: "+32123456789",
        location: "Bruxelles",
        about: "Locuiesc în Belgia de 5 ani și lucrez în IT.",
        profileImage: null,
        isAdmin: false,
        isModerator: false,
        isPremium: false,
        socialLinks: [],
        badges: [],
        points: 50
      },
      {
        username: "user2",
        email: "user2@example.com",
        password: "password123", // In production, this would be hashed
        fullName: "Maria Ionescu",
        phoneNumber: "+32987654321",
        location: "Antwerp",
        about: "Sunt stabilită în Belgia din 2018 și lucrez ca profesoară.",
        profileImage: null,
        isAdmin: false,
        isModerator: true,
        isPremium: true,
        socialLinks: [],
        badges: ["moderator"],
        points: 120
      },
      {
        username: "user3",
        email: "user3@example.com",
        password: "password123", // In production, this would be hashed
        fullName: "Andrei Dumitrescu",
        phoneNumber: "+32567891234",
        location: "Gent",
        about: "Antreprenor român stabilit în Belgia din 2015.",
        profileImage: null,
        isAdmin: false,
        isModerator: false,
        isPremium: true,
        socialLinks: [],
        badges: ["premium"],
        points: 85
      },
    ];
    
    for (const user of demoUsers) {
      await db.insert(users).values(user);
    }
    console.log("Created sample users");
    
    // Get user IDs for reference
    const allUsers = await db.select().from(users);
    const userIds = allUsers.map(user => user.id);
    
    // Create sample services
    const demoServices = [
      {
        userId: userIds[1], // user1
        title: "Servicii de Traducere Română-Flamandă",
        description: "Ofer servicii de traducere profesională din limba română în flamandă și invers. Experiență de peste 5 ani în domeniu și certificări oficiale. Traduc documente oficiale, texte tehnice, medicale, juridice și literare.",
        shortDescription: "Traduceri profesionale română-flamandă pentru documente oficiale și texte specializate.",
        category: "Traduceri",
        location: "Bruxelles",
        contactEmail: "user1@example.com",
        contactPhone: "+32123456789",
        mainImage: null,
        images: [],
        tags: ["traduceri", "flamandă", "română", "documente oficiale"],
        rating: 4,
        reviewCount: 12,
        isPremium: false,
        socialLinks: {}
      },
      {
        userId: userIds[2], // user2
        title: "Consultanță în Afaceri pentru Români în Belgia",
        description: "Servicii de consultanță pentru antreprenorii români care doresc să își deschidă o afacere în Belgia. Asistență completă în procesul de înregistrare a firmei, aspecte fiscale, găsirea finanțării și dezvoltarea planului de afaceri. Experiență practică în piața belgiană și cunoașterea excelentă a legislației locale.",
        shortDescription: "Asistență completă pentru înființarea și dezvoltarea afacerilor românești în Belgia.",
        category: "Consultanță",
        location: "Antwerp",
        contactEmail: "user2@example.com",
        contactPhone: "+32987654321",
        mainImage: null,
        images: [],
        tags: ["afaceri", "consultanță", "fiscalitate", "startup"],
        rating: 5,
        reviewCount: 8,
        isPremium: true,
        socialLinks: {}
      },
      {
        userId: userIds[3], // user3
        title: "Transport Colete România-Belgia",
        description: "Transport regulat de colete între România și Belgia. Plecări săptămânale, prețuri competitive și livrare la domiciliu. Siguranța coletelor garantată prin asigurare. Experiență de peste 7 ani pe această rută și recomandări excelente din partea comunității.",
        shortDescription: "Transport săptămânal de colete între România și Belgia, sigur și la prețuri accesibile.",
        category: "Transport",
        location: "Gent, cu livrare în toată Belgia și România",
        contactEmail: "user3@example.com",
        contactPhone: "+32567891234",
        mainImage: null,
        images: [],
        tags: ["transport", "colete", "România", "livrare"],
        rating: 4,
        reviewCount: 23,
        isPremium: true,
        socialLinks: {}
      },
      {
        userId: userIds[1], // user1
        title: "Meditații Limba Română pentru Copii",
        description: "Ofer meditații în limba română pentru copiii din familii românești care locuiesc în Belgia. Scopul este păstrarea limbii și culturii române în rândul tinerei generații. Folosesc metode interactive și adaptate vârstei, cu accent pe conversație, lectură și scriere.",
        shortDescription: "Meditații interactive în limba română pentru copiii români din Belgia.",
        category: "Educație",
        location: "Bruxelles, posibil și online",
        contactEmail: "user1@example.com",
        contactPhone: "+32123456789",
        mainImage: null,
        images: [],
        tags: ["educație", "română", "copii", "meditații"],
        rating: 5,
        reviewCount: 7,
        isPremium: false,
        socialLinks: {}
      },
    ];
    
    for (const service of demoServices) {
      await db.insert(services).values(service);
    }
    console.log("Created sample services");
    
    // Create sample events
    const currentDate = new Date();
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(currentDate);
    nextMonth.setDate(nextMonth.getDate() + 30);
    
    const demoEvents = [
      {
        userId: userIds[1], // user1
        title: "Seară Culturală Românească",
        description: "O seară dedicată culturii românești, cu muzică tradițională, poezie și gastronomie specifică. Veniți să sărbătorim împreună tradițiile și valorile românești într-un cadru prietenos.",
        date: nextWeek,
        endDate: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
        location: "Centrul Cultural Român, Bruxelles",
        image: null,
        category: "Cultural",
        tags: ["cultură", "tradiții", "muzică", "poezie"],
        socialLinks: {},
        gpsLocation: null,
        participantCount: 0,
        isParticipating: false
      },
      {
        userId: userIds[2], // user2
        title: "Workshop: Integrare Profesională în Belgia",
        description: "Workshop practic despre cum să te integrezi cu succes pe piața muncii din Belgia. Vom discuta despre CV-ul adaptat standardelor locale, interviul de angajare, căutarea locurilor de muncă și aspecte legale privind contractele de muncă.",
        date: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        location: "Biblioteca Centrală, Antwerp",
        image: null,
        category: "Profesional",
        tags: ["carieră", "workshop", "angajare", "CV"],
        socialLinks: {},
        gpsLocation: null,
        participantCount: 0,
        isParticipating: false
      },
      {
        userId: userIds[3], // user3
        title: "Picnic Românesc în Parc",
        description: "Picnic în aer liber pentru familiile românești din Belgia. Aduceți preparate tradiționale pentru a le împărtăși cu ceilalți participanți. Vor fi organizate și jocuri pentru copii.",
        date: nextMonth,
        endDate: new Date(nextMonth.getTime() + 5 * 60 * 60 * 1000), // 5 hours later
        location: "Parcul Cinquantenaire, Bruxelles",
        image: null,
        category: "Social",
        tags: ["picnic", "familie", "comunitate", "relaxare"],
        socialLinks: {},
        gpsLocation: null,
        participantCount: 0,
        isParticipating: false
      },
    ];
    
    for (const event of demoEvents) {
      await db.insert(events).values(event);
    }
    console.log("Created sample events");
    
    // Get event IDs
    const allEvents = await db.select().from(events);
    const eventIds = allEvents.map(event => event.id);
    
    // Create sample event participants
    const demoEventParticipants = [
      {
        eventId: eventIds[0],
        userId: userIds[2]
      },
      {
        eventId: eventIds[0],
        userId: userIds[3]
      },
      {
        eventId: eventIds[1],
        userId: userIds[1]
      },
      {
        eventId: eventIds[1],
        userId: userIds[3]
      },
      {
        eventId: eventIds[2],
        userId: userIds[1]
      },
      {
        eventId: eventIds[2],
        userId: userIds[2]
      }
    ];
    
    for (const participant of demoEventParticipants) {
      await db.insert(eventParticipants).values(participant);
    }
    console.log("Created sample event participants");
    
    // Update participant counts
    for (const eventId of eventIds) {
      const participants = await db
        .select()
        .from(eventParticipants)
        .where(eq(eventParticipants.eventId, eventId));
      
      await db
        .update(events)
        .set({ participantCount: participants.length })
        .where(eq(events.id, eventId));
    }
    
    // Create sample news
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
    const demoNews = [
      {
        title: "Noi oportunități de finanțare pentru antreprenorii români din Belgia",
        content: "Camera de Comerț Belgo-Română a anunțat lansarea unui nou program de finanțare destinat antreprenorilor români din Belgia. Programul oferă granturi de până la 10.000 EUR pentru dezvoltarea afacerilor în domenii precum tehnologia, serviciile și producția. Aplicațiile pot fi depuse începând cu luna viitoare, iar selecția va fi făcută pe baza planurilor de afaceri și a impactului potențial asupra comunității. Pentru mai multe detalii, consultați site-ul oficial al Camerei de Comerț Belgo-Române.",
        source: "Camera de Comerț Belgo-Română",
        sourceUrl: "https://example.com/ccbr",
        category: "Afaceri",
        image: null,
        publishedAt: oneWeekAgo,
        viewCount: 145,
        commentCount: 12
      },
      {
        title: "Festivalul Filmului Românesc revine la Bruxelles",
        content: "A XII-a ediție a Festivalului Filmului Românesc va avea loc la Bruxelles în perioada 15-20 noiembrie. Evenimentul va prezenta cele mai recente și apreciate producții cinematografice românești, inclusiv filme premiate la festivaluri internaționale precum Cannes și Berlin. Pe lângă proiecții, vor fi organizate și sesiuni de discuții cu regizori și actori români. Biletele sunt disponibile online începând de săptămâna viitoare.",
        source: "Institutul Cultural Român din Bruxelles",
        sourceUrl: "https://example.com/icr",
        category: "Cultural",
        image: null,
        publishedAt: twoWeeksAgo,
        viewCount: 230,
        commentCount: 18
      },
      {
        title: "Noi reglementări pentru cetățenii români care lucrează în Belgia",
        content: "Ministerul Muncii din Belgia a anunțat modificări în legislația privind angajarea cetățenilor români. Noile reglementări simplifică procedurile administrative și oferă protecție suplimentară împotriva exploatării la locul de muncă. De asemenea, se introduce posibilitatea de a depune reclamații anonime în caz de abuzuri. Modificările vor intra în vigoare începând cu 1 ianuarie anul viitor.",
        source: "Ministerul Muncii din Belgia",
        sourceUrl: "https://example.com/work",
        category: "Legislație",
        image: null,
        publishedAt: oneMonthAgo,
        viewCount: 312,
        commentCount: 25
      },
      {
        title: "Cursuri gratuite de limba flamandă pentru comunitatea românească",
        content: "Primăria orașului Antwerp, în parteneriat cu Asociația Românilor din Belgia, lansează un program de cursuri gratuite de limba flamandă destinate membrilor comunității românești. Cursurile vor avea loc de două ori pe săptămână, în format fizic și online, și sunt structurate pe mai multe niveluri de competență. Înscrierile sunt deschise până pe 30 ale lunii curente.",
        source: "Primăria Antwerp",
        sourceUrl: "https://example.com/antwerp",
        category: "Educație",
        image: null,
        publishedAt: new Date(oneMonthAgo.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before oneMonthAgo
        viewCount: 198,
        commentCount: 15
      },
    ];
    
    for (const newsItem of demoNews) {
      await db.insert(news).values(newsItem);
    }
    console.log("Created sample news");
    
    // Create sample chat messages
    const roomIds = ["general", "ajutor", "anunturi"];
    const messages = [
      "Salut tuturor! Cum vă merge?",
      "A fost cineva recent la consulat? Cum sunt cozile acum?",
      "Știe cineva un electrician bun în zona Bruxelles?",
      "Mulțumesc pentru informație!",
      "Eu recomand să încercați restaurantul românesc din centru, au mâncare excelentă.",
      "Are cineva experiență cu înscrierea copiilor la școală aici?",
      "Săptămâna viitoare organizăm o întâlnire informală, sunteți bineveniți să participați."
    ];
    
    for (const roomId of roomIds) {
      for (let i = 0; i < 5; i++) {
        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        await db.insert(chatMessages).values({
          userId: randomUserId,
          roomId: roomId,
          message: randomMessage
        });
      }
    }
    console.log("Created sample chat messages");
    
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// If this script is run directly, seed the database
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}