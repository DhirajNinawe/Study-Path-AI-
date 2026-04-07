"use client"

import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { useAuth } from "@/lib/auth-context"
import { BookOpen, Brain, Target, Zap, ChevronRight, Sparkles, BarChart3, Clock, LogIn, LogOut } from "lucide-react"
import Image from "next/image"

export function LandingPage() {
  const { setCurrentPage } = useApp()
  const { user, signInWithGoogle, signOut, loading } = useAuth()

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-success/10 rounded-full blur-[120px]" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg glow">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">StudyPath AI</span>
          </div>

          {/* Auth Nav Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* User avatar + name */}
                <div className="hidden sm:flex items-center gap-2 bg-card/60 border border-border/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-foreground max-w-[120px] truncate">
                    {user.displayName || user.email}
                  </span>
                </div>
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-300"
                  onClick={() => setCurrentPage("dashboard")}
                >
                  Dashboard
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => signOut()}
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all duration-300 gap-2"
                  onClick={signInWithGoogle}
                  disabled={loading}
                  id="landing-signin-btn"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </Button>
                <Button
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-300"
                  onClick={signInWithGoogle}
                  disabled={loading}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm bg-card/80 backdrop-blur-sm rounded-full border border-border/50 text-muted-foreground shadow-lg">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Learning Experience
            <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">New</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground max-w-4xl leading-[1.1] tracking-tight text-balance">
            Master Any Subject with{" "}
            <span className="gradient-text">AI-Powered</span>{" "}
            Study Plans
          </h1>
          
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed text-pretty">
            Take a diagnostic test, get instant analysis of your weak areas, and receive a personalized study plan that adapts to your learning progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 h-12 text-base shadow-lg glow transition-all duration-300"
              onClick={user ? () => setCurrentPage("dashboard") : signInWithGoogle}
              disabled={loading}
            >
              {user ? "Go to Dashboard" : "Start Learning Now"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                className="border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 h-12 text-base gap-2"
                onClick={signInWithGoogle}
                disabled={loading}
              >
                <LogIn className="w-4 h-4" />
                Sign in with Google
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-border/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Active Students</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">95%</p>
              <p className="text-sm text-muted-foreground mt-1">Improvement Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">4.9</p>
              <p className="text-sm text-muted-foreground mt-1">User Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative px-6 py-24 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
        
        <div className="relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Why Choose StudyPath AI?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Experience intelligent learning with AI-driven insights and personalized study paths
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<Brain className="w-6 h-6" />}
              title="Smart Analysis"
              description="AI detects your weak areas from test results and provides targeted recommendations"
              gradient="from-primary/20 to-primary/5"
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6" />}
              title="Personalized Plans"
              description="Get custom study schedules based on your test performance and learning goals"
              gradient="from-success/20 to-success/5"
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Progress Tracking"
              description="Track your improvement with detailed analytics and performance insights"
              gradient="from-warning/20 to-warning/5"
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Gamified Learning"
              description="Earn XP, level up, and maintain streaks to stay motivated"
              gradient="from-accent/20 to-accent/5"
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-6 py-24 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Three Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="01"
              title="Take Diagnostic Test"
              description="Answer MCQ questions to assess your current knowledge level"
              icon={<BookOpen className="w-5 h-5" />}
            />
            <StepCard 
              number="02"
              title="Get AI Analysis"
              description="Receive instant feedback on your weak and strong areas"
              icon={<Brain className="w-5 h-5" />}
            />
            <StepCard 
              number="03"
              title="Follow Study Plan"
              description="Complete your personalized plan and track progress"
              icon={<Target className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-24 lg:px-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/80 rounded-3xl p-8 md:p-12 lg:p-16 max-w-4xl mx-auto border border-border/50 shadow-2xl">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px]" />
          </div>
          <div className="relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full mb-6">
              <Clock className="w-3 h-3" />
              Start in less than 2 minutes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Ready to Transform Your Learning?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Join thousands of students who are already achieving their academic goals with AI-powered study plans
            </p>
            <Button 
              size="lg" 
              className="mt-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-10 h-12 text-base shadow-lg transition-all duration-300"
              onClick={() => setCurrentPage("select")}
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 lg:px-12 border-t border-border/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">StudyPath AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for the future of education
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className="group p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 card-hover">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-primary mb-5`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="relative p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl font-bold text-primary/20">{number}</span>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
