import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AtSign, ImagePlus, Heart, Star, Skull, Cat, Dog, Fish, Coffee, Music, Sparkles, Flame, Moon, Sun, Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Block characters for colored art (from full to empty)
const BLOCK_CHARS = ['█', '▓', '▒', '░', ' '];

// IRC color palette (16 colors) - we'll map to closest
const IRC_COLORS = [
  { r: 255, g: 255, b: 255, code: '00' }, // white
  { r: 0, g: 0, b: 0, code: '01' },       // black
  { r: 0, g: 0, b: 127, code: '02' },     // navy
  { r: 0, g: 147, b: 0, code: '03' },     // green
  { r: 255, g: 0, b: 0, code: '04' },     // red
  { r: 127, g: 0, b: 0, code: '05' },     // brown
  { r: 156, g: 0, b: 156, code: '06' },   // purple
  { r: 252, g: 127, b: 0, code: '07' },   // orange
  { r: 255, g: 255, b: 0, code: '08' },   // yellow
  { r: 0, g: 252, b: 0, code: '09' },     // lime
  { r: 0, g: 147, b: 147, code: '10' },   // teal
  { r: 0, g: 255, b: 255, code: '11' },   // cyan
  { r: 0, g: 0, b: 252, code: '12' },     // blue
  { r: 255, g: 0, b: 255, code: '13' },   // pink
  { r: 127, g: 127, b: 127, code: '14' }, // grey
  { r: 210, g: 210, b: 210, code: '15' }, // light grey
];

// Find closest IRC color
const findClosestColor = (r: number, g: number, b: number): typeof IRC_COLORS[0] => {
  let minDist = Infinity;
  let closest = IRC_COLORS[0];
  
  for (const color of IRC_COLORS) {
    const dist = Math.sqrt(
      Math.pow(r - color.r, 2) + 
      Math.pow(g - color.g, 2) + 
      Math.pow(b - color.b, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  }
  return closest;
};

// Convert image to colored block art (plain text with color codes for IRC)
const imageToColoredBlocks = (img: HTMLImageElement, maxWidth: number = 60, maxHeight: number = 30): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Calculate dimensions
  const aspectRatio = img.width / img.height;
  const charAspect = 0.5; // Characters are about 2x taller than wide
  
  let width = maxWidth;
  let height = Math.floor(width / aspectRatio * charAspect);
  
  if (height > maxHeight) {
    height = maxHeight;
    width = Math.floor(height * aspectRatio / charAspect);
  }

  canvas.width = width;
  canvas.height = height;
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let result = '';
  let lastColorCode = '';
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];
      
      if (a < 128) {
        // Transparent - use space
        result += ' ';
        lastColorCode = '';
      } else {
        // Find closest IRC color
        const color = findClosestColor(r, g, b);
        
        // Calculate brightness to select block character
        const brightness = (r + g + b) / 3 / 255;
        const blockIndex = Math.floor(brightness * (BLOCK_CHARS.length - 1));
        const block = BLOCK_CHARS[Math.min(blockIndex, BLOCK_CHARS.length - 1)];
        
        // Add IRC color code if changed (format: \x03FG,BG)
        const colorCode = `\x03${color.code},${color.code}`;
        if (colorCode !== lastColorCode) {
          result += colorCode;
          lastColorCode = colorCode;
        }
        result += '█'; // Always use full block, color does the work
      }
    }
    result += '\x03\n'; // Reset color at end of line
    lastColorCode = '';
  }

  return result.trim();
};

// Simpler colored HTML output for web display
const imageToColoredHtml = (img: HTMLImageElement, maxWidth: number = 80, maxHeight: number = 40): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const aspectRatio = img.width / img.height;
  const charAspect = 0.5;
  
  let width = maxWidth;
  let height = Math.floor(width / aspectRatio * charAspect);
  
  if (height > maxHeight) {
    height = maxHeight;
    width = Math.floor(height * aspectRatio / charAspect);
  }

  canvas.width = width;
  canvas.height = height;
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let result = '';
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];
      
      if (a < 128) {
        result += ' ';
      } else {
        // Use half-block for better vertical resolution, color it
        result += `[C:${r},${g},${b}]█[/C]`;
      }
    }
    result += '\n';
  }

  return result.trim();
};

// Premade ASCII art collection
const ASCII_ART = [
  {
    name: "Heart",
    icon: Heart,
    art: `  ♥♥   ♥♥
 ♥♥♥♥ ♥♥♥♥
♥♥♥♥♥♥♥♥♥♥
 ♥♥♥♥♥♥♥♥
  ♥♥♥♥♥♥
   ♥♥♥♥
    ♥♥`
  },
  {
    name: "Star",
    icon: Star,
    art: `    ★
   ★★★
  ★★★★★
 ★★★★★★★
★★★★★★★★★
 ★★★★★★★
  ★★★★★
   ★★★
    ★`
  },
  {
    name: "Cat",
    icon: Cat,
    art: ` /\\_/\\  
( o.o ) 
 > ^ <`
  },
  {
    name: "Dog",
    icon: Dog,
    art: `  / \\__
 (    @\\___
 /         O
/   (_____/
/_____/   U`
  },
  {
    name: "Fish",
    icon: Fish,
    art: `><(((º>`
  },
  {
    name: "Coffee",
    icon: Coffee,
    art: `   ) (
  (   ) )
   ) _ (
  (_)_(_)
  |_____|
  /_____\\`
  },
  {
    name: "Music",
    icon: Music,
    art: `♪♫•*¨*•.¸¸♪♫`
  },
  {
    name: "Sparkles",
    icon: Sparkles,
    art: `✧･ﾟ: *✧･ﾟ:*`
  },
  {
    name: "Skull",
    icon: Skull,
    art: `  ___
 /o o\\
|  <  |
 \\___/`
  },
  {
    name: "Flame",
    icon: Flame,
    art: `   )
  ) \\
 / ) (
 \\(_)/`
  },
  {
    name: "Moon",
    icon: Moon,
    art: `   🌙
 ☆  ★  ☆
★   ☆   ★`
  },
  {
    name: "Sun",
    icon: Sun,
    art: ` \\ | /
-- ☀ --
 / | \\`
  },
  {
    name: "Shrug",
    icon: Zap,
    art: `¯\\_(ツ)_/¯`
  },
  {
    name: "Table Flip",
    icon: Zap,
    art: `(╯°□°)╯︵ ┻━┻`
  },
  {
    name: "Lenny",
    icon: Zap,
    art: `( ͡° ͜ʖ ͡°)`
  },
  {
    name: "Bear",
    icon: Zap,
    art: `ʕ•ᴥ•ʔ`
  },
  {
    name: "Disapproval",
    icon: Zap,
    art: `ಠ_ಠ`
  },
  {
    name: "Happy",
    icon: Sparkles,
    art: `(◕‿◕)`
  },
  {
    name: "Sad",
    icon: Zap,
    art: `(╥﹏╥)`
  },
  {
    name: "Rose",
    icon: Sparkles,
    art: `@}-,-'---`
  },
];

interface AsciiArtPickerProps {
  onArtSelect: (art: string) => void;
  onImageUpload?: (file: File) => void;
}

const AsciiArtPicker = ({ onArtSelect }: AsciiArtPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleArtClick = (art: string) => {
    onArtSelect(art);
    setIsOpen(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please select an image file",
      });
      return;
    }

    setIsConverting(true);

    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.onload = () => {
          const coloredArt = imageToColoredBlocks(img, 60, 30);
          if (coloredArt) {
            onArtSelect(coloredArt);
            toast({
              title: "Image converted!",
              description: "Your image has been converted to colored block art",
            });
          }
          setIsConverting(false);
          setIsOpen(false);
        };
        img.onerror = () => {
          toast({
            variant: "destructive",
            title: "Failed to load image",
            description: "Could not process the image",
          });
          setIsConverting(false);
        };
        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Failed to read file",
          description: "Could not read the image file",
        });
        setIsConverting(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Conversion failed",
        description: err instanceof Error ? err.message : "Failed to convert image",
      });
      setIsConverting(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            title="ASCII Art"
          >
            <AtSign className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-64 bg-popover border-border z-[200]"
          sideOffset={5}
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-xs">
            <AtSign className="w-3 h-3" />
            ASCII Art
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Image to ASCII Option */}
          <DropdownMenuItem
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 cursor-pointer"
            disabled={isConverting}
          >
            {isConverting ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4 text-primary" />
            )}
            <span>{isConverting ? 'Converting...' : 'Convert Image to ASCII'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {/* ASCII Art Grid */}
          <ScrollArea className="h-64">
            <div className="grid grid-cols-2 gap-1 p-1">
              {ASCII_ART.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleArtClick(item.art)}
                    className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-accent transition-colors text-left group"
                  >
                    <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                      {item.name}
                    </span>
                    <pre className="text-[8px] leading-tight text-muted-foreground group-hover:text-foreground font-mono whitespace-pre max-w-full overflow-hidden">
                      {item.art.split('\n').slice(0, 3).join('\n')}
                    </pre>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default AsciiArtPicker;
