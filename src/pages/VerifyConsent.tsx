import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Shield } from "lucide-react";

const VerifyConsent = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const verifyConsent = async () => {
      const token = searchParams.get("token");
      const userId = searchParams.get("user");

      if (!token || !userId) {
        setStatus("error");
        setMessage("Invalid verification link. Missing required parameters.");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-parent-consent", {
          body: { token, userId },
        });

        if (error) throw error;

        if (data.success) {
          setStatus("success");
          setMessage("Parental consent has been verified successfully.");
          setUsername(data.username || "");
        } else {
          throw new Error(data.error || "Verification failed");
        }
      } catch (error: any) {
        console.error("Consent verification error:", error);
        setStatus("error");
        setMessage(error.message || "Failed to verify consent. Please try again or contact support.");
      }
    };

    verifyConsent();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            )}
            {status === "error" && (
              <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl">
            {status === "loading" && "Verifying Consent..."}
            {status === "success" && "Consent Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>

          {status === "success" && username && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-400">
                <Shield className="h-4 w-4 inline mr-1" />
                The account for <strong>{username}</strong> is now active.
              </p>
            </div>
          )}

          {status !== "loading" && (
            <div className="pt-4">
              <Button asChild>
                <Link to="/">Return to Justachat</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <p className="text-xs text-muted-foreground mt-4">
              If you believe this is an error, please contact{" "}
              <a href="mailto:support@justachat.net" className="text-primary hover:underline">
                support@justachat.net
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyConsent;
