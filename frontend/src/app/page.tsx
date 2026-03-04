"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FileText, ShieldCheck, Zap, Globe } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleStart = () => {
    if (loading) return;
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary-light/30">
      {/* Navigation */}
      <nav className="border-b border-border/60 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary-dark">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
              <FileText className="text-white h-5 w-5" />
            </div>
            DocHub
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => router.push("/dashboard")} variant="outline" className="border-border hover:bg-muted text-foreground">
                Dashboard
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors hidden sm:block">
                  Log in
                </Link>
                <Button onClick={() => router.push("/register")} className="bg-primary text-white hover:bg-primary-dark shadow-md transition-all hover:shadow-lg">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[600px] bg-primary-light/10 rounded-full blur-[80px] sm:blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border text-xs sm:text-sm text-text-secondary mb-2 sm:mb-4 animate-fade-in shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Now supporting multiple US Visa types
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-text-primary animate-fade-in" style={{ animationDelay: "100ms" }}>
            The Smartest Way to <br className="hidden md:block" /> Apply for a US Visa
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto animate-fade-in px-4 sm:px-0" style={{ animationDelay: "200ms" }}>
            Upload your documents, extract data automatically, and generate your DS-160 form in minutes. Supporting F-1, H-1B, B-1/B-2, and J-1 visas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button size="lg" onClick={handleStart} className="w-full sm:w-auto text-base h-12 px-8 bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg transition-all">
              Start Application
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border flex flex-col items-center text-center group hover:shadow-md transition-all hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2 md:mb-3">Dynamic Requirements</h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                Select your visa type (F-1, H-1B, B-1/B-2, J-1) and instantly see exactly which documents you need—no less, no more.
              </p>
            </div>
            
            <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border flex flex-col items-center text-center group hover:shadow-md transition-all hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2 md:mb-3">AI Data Extraction</h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                Advanced OCR automatically extracts your details from passports, I-20s, and offer letters to pre-fill your DS-160 application.
              </p>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border flex flex-col items-center text-center group sm:col-span-2 md:col-span-1 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="h-14 w-14 rounded-xl bg-primary-light/20 flex items-center justify-center text-primary mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2 md:mb-3">Instant Verification</h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                We cross-check extracted data across all your documents to highlight inconsistencies before you submit to the consulate.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8 md:py-12 px-4 sm:px-6 text-center text-text-secondary">
        <p className="text-sm md:text-base">© {new Date().getFullYear()} DocHub. Streamlining US Visa Applications.</p>
      </footer>
    </div>
  );
}
