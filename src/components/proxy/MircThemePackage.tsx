import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Archive, Download, Loader2, Eye, EyeOff, Sparkles, Radio, Smile, Zap, Palette, Command } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { generateThemeScript, generateMircReadme, generateServersIni, type MircPackageConfig } from "@/lib/mircThemeGenerator";
import { Badge } from "@/components/ui/badge";

interface MircThemePackageProps {
  isDownloadingZip: boolean;
  setIsDownloadingZip: (value: boolean) => void;
}

const MircThemePackage = ({ isDownloadingZip, setIsDownloadingZip }: MircThemePackageProps) => {
  const [serverAddress, setServerAddress] = useState("157.245.174.197");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const downloadThemePackage = async () => {
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    if (!nickname) {
      toast.error("Please enter a nickname");
      return;
    }

    setIsDownloadingZip(true);
    try {
      const config: MircPackageConfig = {
        serverAddress,
        email,
        password,
        nickname,
        radioStreamUrl: "https://justachat.lovable.app"
      };

      const zip = new JSZip();
      
      // Main theme script with all features
      zip.file("jac-2026-theme.mrc", generateThemeScript(config));
      
      // Server configuration
      zip.file("servers.ini", generateServersIni(serverAddress));
      
      // Comprehensive README
      zip.file("README.txt", generateMircReadme());
      
      const content = await zip.generateAsync({ type: "blob" });
      
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jac-2026-mirc-theme.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Downloaded JAC 2026 Theme! Load jac-2026-theme.mrc in mIRC and type /jac to connect!");
    } catch (err) {
      console.error("Failed to create theme package:", err);
      toast.error("Failed to create package");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const features = [
    { icon: Palette, label: "Dark Theme", desc: "Matches web colors" },
    { icon: Smile, label: "Emoji Picker", desc: "4 categories" },
    { icon: Zap, label: "User Actions", desc: "Slap, hug, wave..." },
    { icon: Command, label: "Quick Commands", desc: "One-click ops" },
    { icon: Palette, label: "Text Formatter", desc: "Colors & styles" },
    { icon: Radio, label: "Radio Player", desc: "Embedded controls" },
  ];

  return (
    <Card className="border-primary relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            JAC 2026 Ultimate mIRC Theme
          </CardTitle>
          <Badge variant="secondary" className="text-xs">v2026.1</Badge>
        </div>
        <CardDescription>
          Complete mIRC customization with dark theme, emoji picker, user actions, radio player, and more!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Feature grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Credentials form */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="theme-server">Server Address</Label>
            <Input
              id="theme-server"
              placeholder="157.245.174.197"
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme-nickname">Nickname</Label>
            <Input
              id="theme-nickname"
              placeholder="YourNickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="theme-email">Email</Label>
            <Input
              id="theme-email"
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme-password">Password</Label>
            <div className="relative">
              <Input
                id="theme-password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={downloadThemePackage}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          disabled={isDownloadingZip}
        >
          {isDownloadingZip ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Theme Package...</>
          ) : (
            <><Archive className="mr-2 h-5 w-5" /> Download JAC 2026 Theme Package</>
          )}
        </Button>

        {/* Quick start */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
          <p className="font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            After downloading:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Extract the ZIP file</li>
            <li>Open mIRC and press <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">Alt+R</kbd></li>
            <li>Click <strong>File → Load</strong> and select <code className="bg-background px-1 rounded">jac-2026-theme.mrc</code></li>
            <li>Type <code className="bg-background px-1 rounded">/jac</code> to connect with all features!</li>
          </ol>
        </div>

        {/* Available commands preview */}
        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-medium">Included Commands:</p>
          <div className="flex flex-wrap gap-2">
            {["/jac.emoji", "/jac.actions", "/jac.commands", "/jac.format", "/jac.radio"].map(cmd => (
              <code key={cmd} className="text-xs bg-muted px-2 py-1 rounded font-mono">{cmd}</code>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <strong>Note:</strong> Your credentials are embedded in the script. Keep it private and don't share.
        </div>
      </CardContent>
    </Card>
  );
};

export default MircThemePackage;
