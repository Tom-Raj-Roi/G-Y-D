import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const { signIn, signUp, user } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const set = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setter(e.target.value);

  useEffect(() => {
    if (user && !isPasswordRecovery) {
      navigate("/admin");
    }
  }, [user, navigate, isPasswordRecovery]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
        toast.info(translate("auth.toast.update_password_info", "You can now update your password."));
      }
    });
    return () => subscription.unsubscribe();
  }, [translate]);

  const handlePasswordReset = async () => {
    if (!email) return toast.error(translate("auth.toast.email_required", "Please enter your email address first."));
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` });
    if (error) toast.error(error.message); else toast.success(translate("auth.toast.password_reset_sent", "Password reset link sent to your email."));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(translate("auth.toast.signed_in", "Signed in"));
      navigate("/admin");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(translate("auth.toast.account_created", "Account created! Please check your email to verify your account before signing in."));
      // Reset form fields after successful sign-up
      setFullName("");
      setEmail("");
      setPassword("");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error(translate("auth.toast.password_required", "Password cannot be empty."));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(translate("auth.toast.password_updated", "Password updated successfully!"));
      setIsPasswordRecovery(false);
      navigate("/admin");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <h1 className="font-display font-bold text-3xl text-gradient mb-6 text-center">{translate("auth.title", "Admin Access")}</h1>
        <Tabs defaultValue="signin" className="bg-card border rounded-2xl p-6 shadow-card">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">{translate("auth.signin_tab", "Sign In")}</TabsTrigger>
            <TabsTrigger value="signup">{translate("auth.signup_tab", "Sign Up")}</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div><Label>{translate("auth.email", "Email")}</Label><Input required type="email" value={email} onChange={set(setEmail)} /></div>
              <div><Label>{translate("auth.password", "Password")}</Label><Input required type="password" value={password} onChange={set(setPassword)} /></div>
              <Button type="submit" disabled={loading} className="w-full bg-primary-gradient">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {translate("auth.signin_button", "Sign In")}
              </Button>
              <div className="text-center">
                <Button variant="link" type="button" onClick={handlePasswordReset} className="text-xs">{translate("auth.forgot_password", "Forgot password?")}</Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div><Label>{translate("auth.full_name", "Full Name")}</Label><Input value={fullName} onChange={set(setFullName)} /></div>
              <div><Label>{translate("auth.email", "Email")}</Label><Input required type="email" value={email} onChange={set(setEmail)} /></div>
              <div><Label>{translate("auth.password", "Password")}</Label><Input required type="password" minLength={6} value={password} onChange={set(setPassword)} /></div>
              <Button type="submit" disabled={loading} className="w-full bg-primary-gradient">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {translate("auth.create_account", "Create Account")}
              </Button>
              <p className="text-xs text-muted-foreground text-center">{translate("auth.signup_note", "After signup, an existing admin must grant you admin access.")}</p>
            </form>
          </TabsContent>
        </Tabs>
        {isPasswordRecovery && (
          <div className="mt-6 bg-card border rounded-2xl p-6 shadow-card">
            <h2 className="font-display font-bold text-2xl text-gradient mb-4 text-center">{translate("auth.update_password_title", "Update Your Password")}</h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div><Label>{translate("auth.new_password", "New Password")}</Label><Input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" disabled={loading} className="w-full bg-primary-gradient">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {translate("auth.update_password_button", "Update Password")}
              </Button>
            </form>
          </div>
        )}
        <p className="text-center mt-4"><Link to="/" className="text-sm text-muted-foreground hover:text-primary">{translate("auth.back_to_home", "← Back to home")}</Link></p>
      </div>
    </Layout>
  );
}
