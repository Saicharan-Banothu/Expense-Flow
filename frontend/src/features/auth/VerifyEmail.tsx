import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    api.post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email address..."}
            {status === "success" && "Your email has been successfully verified!"}
            {status === "error" && "Invalid or expired verification link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <Button className="w-full" onClick={() => navigate("/login")}>
              Proceed to Login
            </Button>
          )}
          {status === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please try registering again or contact support if you continue to have issues.
              </p>
              <Link to="/register">
                <Button variant="outline" className="w-full">
                  Back to Registration
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
