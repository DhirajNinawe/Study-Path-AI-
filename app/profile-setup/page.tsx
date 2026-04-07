"use client";

// app/profile-setup/page.tsx
// Onboarding page for new users — collect Name, Age, Gender
// Saves to MongoDB via /api/auth/profile

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Brain, User, Calendar, Users2, ArrowRight, Loader2, Sparkles } from "lucide-react";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, loading, profileComplete } = useAuth();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0); // animate in

  // Redirect if not authenticated or profile already done
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/auth");
      else if (profileComplete) router.replace("/");
    }
  }, [user, loading, profileComplete, router]);

  // Pre-fill name from Firebase display name
  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user]);

  // Staggered animation
  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!age || Number(age) < 5 || Number(age) > 100) { setError("Please enter a valid age (5–100)."); return; }
    if (!gender) { setError("Please select your gender."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user!.uid,
          email: user!.email || "",
          name: name.trim(),
          age: Number(age),
          gender,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      router.replace("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 right-20 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div
        className="relative z-10 w-full max-w-md transition-all duration-700"
        style={{ opacity: step ? 1 : 0, transform: step ? "translateY(0)" : "translateY(24px)" }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">One last step</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tell us a little about yourself so we can personalise your experience
          </p>
        </div>

        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-2xl">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-7">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === 0 ? "w-8 bg-green-500" : "w-4 bg-border"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background/60 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 transition-all"
                />
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">
                Age
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  placeholder="e.g. 19"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="5"
                  max="100"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background/60 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 transition-all"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2.5 text-sm font-medium rounded-xl border transition-all duration-150 ${
                      gender === g
                        ? "bg-green-500/15 border-green-500/50 text-green-400"
                        : "bg-background/40 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-green-500/20 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-5">
          This information is used only to personalise your study experience
        </p>
      </div>
    </div>
  );
}
