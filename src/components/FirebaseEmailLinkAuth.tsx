
import React, { useState, useEffect } from "react";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  User,
  onAuthStateChanged,
} from "firebase/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const EMAIL_STORAGE_KEY = "emailForSignIn";

export default function FirebaseEmailLinkAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const [email, setEmail] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const auth = getAuth();

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let storedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
      if (!storedEmail) {
        storedEmail = window.prompt("Please provide your email for confirmation");
      }

      if (storedEmail) {
        setAuthState((s) => ({ ...s, loading: true, error: null }));
        signInWithEmailLink(auth, storedEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem(EMAIL_STORAGE_KEY);
            window.history.replaceState(null, "", window.location.pathname);
          })
          .catch((err) => {
            console.error(err);
            setAuthState((s) => ({
              ...s,
              loading: false,
              error: "Failed to sign in. The link may be invalid or expired.",
            }));
          });
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({ user, loading: false, error: null });
    }, (error) => {
      console.error(error);
      setAuthState({ user: null, loading: false, error: "An authentication error occurred." });
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setAuthState((s) => ({ ...s, error: "Please enter your email address." }));
      return;
    }

    setIsSubmitting(true);
    setAuthState((s) => ({ ...s, error: null }));

    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
      setEmailSent(true);
    } catch (err) {
      console.error(err);
      setAuthState((s) => ({ ...s, error: "Failed to send sign-in link. Please try again." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
  };

  if (authState.loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (authState.user) {
    return (
      <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
        <p className="text-gray-600">
          You are signed in as{" "}
          <span className="font-semibold text-blue-600">{authState.user.email}</span>.
        </p>
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
        <p className="text-gray-600 mt-2">
          A sign-in link has been sent to <span className="font-semibold">{email}</span>. Click the
          link to complete your login.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In with Email</h2>
      <p className="text-gray-600 mb-6">
        Enter your email below to receive a magic link to sign in.
      </p>
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        {authState.error && <p className="text-sm text-red-600">{authState.error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? "Sending..." : "Send Magic Link"}
        </button>
      </form>
    </div>
  );
}
