import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Power, PowerOff, Check, Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CHAT_BOTS } from "@/lib/chatBots";

interface BotSettings {
  id: string;
  enabled: boolean;
  allowed_channels: string[];
  updated_at: string;
}

const AdminBots = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isOwner, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (!isAdmin && !isOwner))) {
      navigate("/");
    }
  }, [user, isAdmin, isOwner, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bot settings
        const { data: botData, error: botError } = await supabase
          .from("bot_settings")
          .select("*")
          .limit(1)
          .single();

        if (botError && botError.code !== "PGRST116") {
          console.error("Error fetching bot settings:", botError);
        }
        
        if (botData) {
          setSettings(botData);
        }

        // Fetch channels
        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select("id, name")
          .eq("is_hidden", false)
          .order("name");

        if (channelError) {
          console.error("Error fetching channels:", channelError);
        } else {
          setChannels(channelData || []);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("bot_settings")
        .update({ enabled, updated_by: user?.id })
        .eq("id", settings.id);

      if (error) throw error;

      setSettings({ ...settings, enabled });
      toast.success(enabled ? "Bots enabled" : "Bots disabled");
    } catch (err) {
      console.error("Error updating bot settings:", err);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChannelToggle = (channelName: string, checked: boolean) => {
    if (!settings) return;

    const newChannels = checked
      ? [...settings.allowed_channels, channelName]
      : settings.allowed_channels.filter((c) => c !== channelName);

    setSettings({ ...settings, allowed_channels: newChannels });
  };

  const handleSaveChannels = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("bot_settings")
        .update({ 
          allowed_channels: settings.allowed_channels,
          updated_by: user?.id 
        })
        .eq("id", settings.id);

      if (error) throw error;

      toast.success("Channel settings saved");
    } catch (err) {
      console.error("Error saving channels:", err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Bot Management</h1>
            <p className="text-muted-foreground">Control simulated chat users</p>
          </div>
        </div>

        {/* Master Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {settings?.enabled ? (
                <Power className="h-5 w-5 text-green-500" />
              ) : (
                <PowerOff className="h-5 w-5 text-muted-foreground" />
              )}
              Bot Status
            </CardTitle>
            <CardDescription>
              Enable or disable all simulated chat users globally
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="bot-toggle" className="text-base">
                  {settings?.enabled ? "Bots are active" : "Bots are disabled"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {settings?.enabled
                    ? "Simulated users will appear and chat in allowed rooms"
                    : "No simulated users will appear in any room"}
                </p>
              </div>
              <Switch
                id="bot-toggle"
                checked={settings?.enabled ?? false}
                onCheckedChange={handleToggleEnabled}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Channel Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Allowed Channels</CardTitle>
            <CardDescription>
              Select which chat rooms the bots can appear in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`channel-${channel.id}`}
                    checked={settings?.allowed_channels.includes(channel.name) ?? false}
                    onCheckedChange={(checked) =>
                      handleChannelToggle(channel.name, checked as boolean)
                    }
                    disabled={saving || !settings?.enabled}
                  />
                  <Label
                    htmlFor={`channel-${channel.id}`}
                    className="text-sm font-medium capitalize cursor-pointer"
                  >
                    #{channel.name}
                  </Label>
                </div>
              ))}
            </div>
            <Button
              onClick={handleSaveChannels}
              disabled={saving || !settings?.enabled}
              className="mt-4"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save Channel Settings
            </Button>
          </CardContent>
        </Card>

        {/* Bot List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Bots ({CHAT_BOTS.length})</CardTitle>
            <CardDescription>
              List of all simulated chat users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CHAT_BOTS.map((bot) => (
                <div
                  key={bot.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      settings?.enabled
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {bot.username[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{bot.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {bot.style} • {bot.gender}
                    </p>
                  </div>
                  <div
                    className={`h-2 w-2 rounded-full ${
                      settings?.enabled ? "bg-green-500" : "bg-muted-foreground"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
};

export default AdminBots;
