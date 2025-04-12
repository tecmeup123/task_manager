import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { User, UserCircle, UserCog, Shield, Star, Heart, Smile, Camera, 
  Music, BookOpen, Coffee, Zap, Award, Gift, Sun } from "lucide-react";
import { AvatarShape, AvatarBackground, UserAvatar } from "./user-avatar";
import { User as UserType } from "@shared/schema";

const AVATAR_COLORS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#A855F7", // Purple
  "#14B8A6", // Teal
  "#F43F5E", // Rose
];

const AVATAR_SHAPES: { label: string; value: AvatarShape }[] = [
  { label: "Circle", value: "circle" },
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Hexagon", value: "hexagon" },
];

const AVATAR_ICONS: { label: string; value: string; icon: React.ReactNode }[] = [
  { label: "User", value: "user", icon: <User className="h-4 w-4" /> },
  { label: "Circle", value: "userCircle", icon: <UserCircle className="h-4 w-4" /> },
  { label: "Settings", value: "userCog", icon: <UserCog className="h-4 w-4" /> },
  { label: "Shield", value: "shield", icon: <Shield className="h-4 w-4" /> },
  { label: "Star", value: "star", icon: <Star className="h-4 w-4" /> },
  { label: "Heart", value: "heart", icon: <Heart className="h-4 w-4" /> },
  { label: "Smile", value: "smile", icon: <Smile className="h-4 w-4" /> },
  { label: "Camera", value: "camera", icon: <Camera className="h-4 w-4" /> },
  { label: "Music", value: "music", icon: <Music className="h-4 w-4" /> },
  { label: "Book", value: "book", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Coffee", value: "coffee", icon: <Coffee className="h-4 w-4" /> },
  { label: "Zap", value: "zap", icon: <Zap className="h-4 w-4" /> },
  { label: "Award", value: "award", icon: <Award className="h-4 w-4" /> },
  { label: "Gift", value: "gift", icon: <Gift className="h-4 w-4" /> },
  { label: "Sun", value: "sun", icon: <Sun className="h-4 w-4" /> },
];

const AVATAR_BACKGROUNDS: { label: string; value: AvatarBackground }[] = [
  { label: "Solid", value: "solid" },
  { label: "Gradient", value: "gradient" },
  { label: "Pattern", value: "pattern" },
];

interface AvatarCustomizerProps {
  user: UserType | null;
  onChange: (avatarSettings: {
    avatarColor: string;
    avatarShape: AvatarShape;
    avatarIcon: string;
    avatarBackground: AvatarBackground;
  }) => void;
}

export default function AvatarCustomizer({ user, onChange }: AvatarCustomizerProps) {
  // Initialize with user's avatar settings or defaults
  const [avatarColor, setAvatarColor] = useState<string>(
    user?.avatarColor || "#6366F1"
  );
  const [avatarShape, setAvatarShape] = useState<AvatarShape>(
    (user?.avatarShape as AvatarShape) || "circle"
  );
  const [avatarIcon, setAvatarIcon] = useState<string>(
    user?.avatarIcon || "user"
  );
  const [avatarBackground, setAvatarBackground] = useState<AvatarBackground>(
    (user?.avatarBackground as AvatarBackground) || "gradient"
  );
  const [customColor, setCustomColor] = useState<string>("");

  // Update parent when avatar settings change
  useEffect(() => {
    onChange({
      avatarColor,
      avatarShape,
      avatarIcon,
      avatarBackground,
    });
  }, [avatarColor, avatarShape, avatarIcon, avatarBackground, onChange]);

  // Apply custom color when set
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const applyCustomColor = () => {
    if (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) {
      setAvatarColor(customColor);
    }
  };

  const randomizeAvatar = () => {
    // Random color
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    
    // Random shape
    const randomShape = AVATAR_SHAPES[Math.floor(Math.random() * AVATAR_SHAPES.length)].value;
    
    // Random icon
    const randomIcon = AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)].value;
    
    // Random background
    const randomBg = AVATAR_BACKGROUNDS[Math.floor(Math.random() * AVATAR_BACKGROUNDS.length)].value;
    
    setAvatarColor(randomColor);
    setAvatarShape(randomShape);
    setAvatarIcon(randomIcon);
    setAvatarBackground(randomBg);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Preview Section */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg mb-4 w-full flex flex-col items-center">
            <UserAvatar
              username={user?.username}
              fullName={user?.fullName}
              size="xl"
              avatarColor={avatarColor}
              avatarShape={avatarShape}
              avatarIcon={avatarIcon}
              avatarBackground={avatarBackground}
              className="mb-4"
            />
            <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={randomizeAvatar}
            className="w-full md:w-auto"
          >
            Randomize Avatar
          </Button>
        </div>

        {/* Customization Section */}
        <div className="w-full md:w-2/3 space-y-6">
          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Avatar Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_COLORS.map((color) => (
                <div 
                  key={color}
                  className={`h-8 w-8 rounded-full cursor-pointer border-2 ${
                    color === avatarColor ? 'border-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAvatarColor(color)}
                />
              ))}
            </div>
            <div className="flex mt-2 items-center space-x-2">
              <Input 
                type="text" 
                placeholder="#FF5533" 
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-36"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={applyCustomColor}
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Shape Selection */}
          <div className="space-y-2">
            <Label>Avatar Shape</Label>
            <RadioGroup
              value={avatarShape}
              onValueChange={(value) => setAvatarShape(value as AvatarShape)}
              className="grid grid-cols-2 md:grid-cols-4 gap-2"
            >
              {AVATAR_SHAPES.map((shape) => (
                <div key={shape.value} className="flex items-center">
                  <RadioGroupItem
                    value={shape.value}
                    id={`shape-${shape.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`shape-${shape.value}`}
                    className="flex items-center justify-center p-2 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                  >
                    {shape.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Avatar Icon</Label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {AVATAR_ICONS.map((iconOption) => (
                <Button
                  key={iconOption.value}
                  type="button"
                  variant={avatarIcon === iconOption.value ? "default" : "outline"}
                  className="p-2 h-auto flex items-center justify-center gap-2"
                  onClick={() => setAvatarIcon(iconOption.value)}
                >
                  {iconOption.icon}
                  <span className="text-xs">{iconOption.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Background Style */}
          <div className="space-y-2">
            <Label>Background Style</Label>
            <RadioGroup
              value={avatarBackground}
              onValueChange={(value) => setAvatarBackground(value as AvatarBackground)}
              className="grid grid-cols-3 gap-2"
            >
              {AVATAR_BACKGROUNDS.map((bg) => (
                <div key={bg.value} className="flex items-center">
                  <RadioGroupItem
                    value={bg.value}
                    id={`bg-${bg.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`bg-${bg.value}`}
                    className="flex items-center justify-center p-2 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 w-full"
                  >
                    {bg.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}