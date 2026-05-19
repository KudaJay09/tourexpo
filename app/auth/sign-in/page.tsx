"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export const dynamic = "force-dynamic";

function getFriendlyFirebaseAuthError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const authError = error as { code?: unknown; message?: unknown };
    const code = typeof authError.code === "string" ? authError.code : "";

    switch (code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/email-already-in-use":
        return "That email is already registered. Try signing in instead.";
      case "auth/weak-password":
        return "Password must be at least 6 characters long.";
      case "auth/operation-not-allowed":
        return "Email/password sign-up is disabled in Firebase. Enable it in the Firebase console.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/user-not-found":
        return "No account found for that email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      default:
        break;
    }

    if (typeof authError.message === "string" && authError.message.trim()) {
      return authError.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Authentication failed.";
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError(
        "Firebase Auth not initialized. Check your environment variables.",
      );
      return;
    }

    const normalizedEmail = email.trim();

    if (isSignUp && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getFriendlyFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError(
        "Firebase Auth not initialized. Check your environment variables.",
      );
      return;
    }
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(getFriendlyFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = () => {
    setError("Facebook sign-in is coming soon.");
  };

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage: "url(/images/bgimage.jpg)",
        }}
      />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-blue-600">SmartTravel</h1>
          {isSignUp ? (
            <p className="mb-6 text-gray-600">
              Create your account to start exploring amazing destinations.
            </p>
          ) : (
            <p className="mb-6 text-gray-600">
              Welcome back! Login to continue exploring amazing destinations.
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg text-gray-700 bg-gray-200 px-3 py-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="mt-1 w-full rounded-lg text-gray-700 bg-gray-200 px-3 py-2"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">
              Passwords must be at least 6 characters.
            </p>

            {isSignUp && (
              <div>
                <input
                  type="password"
                  // value={password}
                  // onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="mt-5 w-full rounded-lg text-gray-700 bg-gray-200 px-3 py-2"
                  placeholder="Confirm Password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Passwords must be at least 6 characters.
                </p>
              </div>
            )}
            {!isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setError("Password reset coming soon.");
                }}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-indigo-600 py-2  font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-2 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            aria-label="Sign in with Google"
            title="Sign in with Google"
            className="rounded-full border border-gray-300 bg-white p-2 disabled:opacity-50 hover:bg-gray-50 flex items-center justify-center h-10 w-10"
          >
            <FcGoogle className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleFacebookSignIn}
            disabled={loading}
            aria-label="Sign in with Facebook"
            title="Sign in with Facebook"
            className="rounded-full border border-blue-600 bg-blue-600 p-2  disabled:opacity-50 flex items-center justify-center h-10 w-10 hover:bg-blue-700"
          >
            <FaFacebookF className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
