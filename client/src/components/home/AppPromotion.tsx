import { Button } from "@/components/ui/button";

export default function AppPromotion() {
  return (
    <section className="py-16 bg-primary text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-white"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-white"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
              Comunitatea ta, în buzunarul tău
            </h2>
            <p className="text-lg mb-6">
              Descarcă aplicația noastră mobilă pentru a rămâne conectat cu comunitatea 
              românească din Belgia oriunde te-ai afla.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex items-center justify-center px-6 py-3 bg-black text-white border-black hover:bg-black/80">
                <i className="fab fa-apple text-2xl mr-2"></i>
                <div className="text-left">
                  <div className="text-xs">Descarcă pe</div>
                  <div className="text-sm font-bold">App Store</div>
                </div>
              </Button>
              <Button variant="outline" className="flex items-center justify-center px-6 py-3 bg-black text-white border-black hover:bg-black/80">
                <i className="fab fa-google-play text-2xl mr-2"></i>
                <div className="text-left">
                  <div className="text-xs">Descarcă pe</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Aplicația Comunitatea Românilor din Belgia pe telefon mobil" 
              className="max-w-xs rounded-3xl shadow-2xl animate-[float_3s_ease-in-out_infinite]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
