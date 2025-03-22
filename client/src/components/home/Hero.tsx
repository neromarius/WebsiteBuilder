import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hero() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3,
        duration: 0.8 
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const statsVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        delay: 0.7
      }
    }
  };

  return (
    <section className="relative bg-primary text-white overflow-hidden" style={{ height: '85vh' }}>
      {/* Hero Background with Enhanced Parallax Effect */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-cover bg-center parallax-bg" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1559682468-3c9a1edf4158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')` 
        }}
      >
        {/* Animated overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/70"
        />
      </motion.div>

      {/* Content Container */}
      <div className="container mx-auto px-4 h-full flex flex-col justify-center">
        <motion.div 
          className="relative z-10 max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-playfair font-bold mb-4 leading-tight"
            variants={itemVariants}
            style={{ textShadow: '0 5px 15px rgba(255, 215, 0, 0.5)' }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block"
            >
              Comunitatea
            </motion.span>{" "}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-block"
            >
              românilor
            </motion.span>{" "}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="inline-block"
            >
              din Belgia
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl mb-8 leading-relaxed"
            variants={itemVariants}
          >
            Conectăm românii din Belgia, oferind un spațiu virtual pentru servicii, 
            evenimente, știri și discuții. Fii parte din comunitatea noastră!
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            variants={itemVariants}
          >
            <Link href="/auth/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="px-6 py-6 bg-secondary text-primary font-bold hover:bg-secondary/90 shadow-xl transform transition-all duration-500 ease-in-out hover:shadow-[0_0_15px_rgba(255,215,0,0.8)]">
                  Înscrie-te acum
                </Button>
              </motion.div>
            </Link>
            <Link href="/servicii">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="px-6 py-6 border-2 border-white text-white font-bold hover:bg-white hover:text-primary shadow-lg transform transition-all duration-500 ease-in-out">
                  Explorează servicii
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Statistics with enhanced animation */}
        <motion.div 
          className="absolute bottom-10 right-10 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-lg hidden md:block border border-white/20"
          variants={statsVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(10px)"
          }}
        >
          <div className="grid grid-cols-3 gap-8">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1, color: "#FFD700" }}
            >
              <motion.p 
                className="text-3xl font-bold text-secondary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                2,500+
              </motion.p>
              <p className="text-sm">Membri</p>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1, color: "#FFD700" }}
            >
              <motion.p 
                className="text-3xl font-bold text-secondary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                450+
              </motion.p>
              <p className="text-sm">Servicii</p>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1, color: "#FFD700" }}
            >
              <motion.p 
                className="text-3xl font-bold text-secondary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                120+
              </motion.p>
              <p className="text-sm">Evenimente/an</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            className="flex flex-col items-center"
          >
            <span className="text-sm font-medium mb-2">Scroll pentru mai multe</span>
            <motion.div 
              className="w-5 h-10 rounded-full border-2 border-white flex justify-center p-1"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div 
                className="w-1.5 h-1.5 bg-white rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
