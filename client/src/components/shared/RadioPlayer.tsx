import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Volume2, VolumeX, X, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function RadioPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [radioInfo, setRadioInfo] = useState({ 
    title: 'Conectare...', 
    artist: '' 
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayer = () => {
    setIsOpen(!isOpen);
  };

  const closePlayer = () => {
    setIsOpen(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://live.kissfm.ro/kissfm.aacp');
      audioRef.current.volume = volume / 100;
      
      // Update radio info periodically (in a real app, this would come from the stream metadata)
      setTimeout(() => {
        setRadioInfo({
          title: 'Kiss FM Romania',
          artist: 'Muzică live'
        });
      }, 2000);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={togglePlayer}
        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Ascultă radio"
      >
        <Music size={20} />
      </Button>
      
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-64 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold">Kiss FM Romania</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={closePlayer}
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="flex items-center mb-3">
              <img 
                src="https://www.kissfm.ro/static/theme-kissfm2020/images/kiss-logo-new.png" 
                alt="Kiss FM" 
                className="w-16 h-16 object-contain mr-3"
              />
              <div>
                <p className="font-medium">Acum rulează:</p>
                <p className="text-sm text-neutral-dark">{radioInfo.title}</p>
                <p className="text-xs text-neutral-dark/70">{radioInfo.artist}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-8 w-8 text-primary"
                onClick={togglePlayback}
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </Button>
              
              <div className="flex-grow mx-2">
                <Slider
                  defaultValue={[volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                />
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-8 w-8 text-primary"
                onClick={() => handleVolumeChange(volume > 0 ? [0] : [80])}
              >
                {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
