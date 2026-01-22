import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onJoin: (username: string) => void;
}

const WelcomeScreen = ({ onJoin }: WelcomeScreenProps) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }
    if (username.trim().length > 20) {
      setError("Username must be less than 20 characters");
      return;
    }
    setError("");
    onJoin(username.trim());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-2xl jac-gradient-bg flex items-center justify-center mb-4 animate-pulse-glow">
            <MessageCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-5xl font-bold jac-gradient-text">JAC</h1>
          <p className="text-muted-foreground mt-2">Just A Chat</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-xl">
          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Enter your username to join the conversation
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Choose a username..."
                className="w-full bg-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                maxLength={20}
              />
              {error && (
                <p className="text-destructive text-xs mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="jac"
              size="lg"
              className="w-full"
              disabled={!username.trim()}
            >
              Join Chat
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          Connect instantly. Chat freely. No sign-up required.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
