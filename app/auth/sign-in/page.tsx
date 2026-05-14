"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
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

  return (
    <div
      className="flex flex-1 items-center justify-center min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, var(--tw-gradient-from, #eff6ff), var(--tw-gradient-to, #e0e7ff))",
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          TourExpo
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Smart travel recommendations
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Passwords must be at least 6 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
            or
          </span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full rounded border border-gray-300 bg-white py-2 text-gray-900 font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 flex items-center justify-center gap-2"
        >
          <FcGoogle className="h-5 w-5" />
          {loading ? "Loading..." : "Sign In with Google"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
