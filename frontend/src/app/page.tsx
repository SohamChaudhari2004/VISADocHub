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
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-zinc-800/60 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText className="text-white h-5 w-5" />
            </div>
            DocHub
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => router.push("/dashboard")} variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                Dashboard
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Log in
                </Link>
                <Button onClick={() => router.push("/register")} className="bg-white text-black hover:bg-zinc-200">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 mb-4 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Now supporting multiple US Visa types
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white to-zinc-500 animate-fade-in" style={{ animationDelay: "100ms" }}>
            The Smartest Way to <br className="hidden md:block" /> Apply for a US Visa
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
            Upload your documents, extract data automatically, and generate your DS-160 form in minutes. Supporting F-1, H-1B, B-1/B-2, and J-1 visas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button size="lg" onClick={handleStart} className="w-full sm:w-auto text-base h-12 px-8 bg-white text-black hover:bg-zinc-200">
              Start Application
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex flex-col items-center text-center group hover:bg-zinc-900 transition-colors">
              <div className="h-14 w-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dynamic Requirements</h3>
              <p className="text-zinc-400 leading-relaxed">
                Select your visa type (F-1, H-1B, B-1/B-2, J-1) and instantly see exactly which documents you need—no less, no more.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex flex-col items-center text-center group hover:bg-zinc-900 transition-colors">
              <div className="h-14 w-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Data Extraction</h3>
              <p className="text-zinc-400 leading-relaxed">
                Advanced OCR automatically extracts your details from passports, I-20s, and offer letters to pre-fill your DS-160 application.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex flex-col items-center text-center group hover:bg-zinc-900 transition-colors">
              <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Verification</h3>
              <p className="text-zinc-400 leading-relaxed">
                We cross-check extracted data across all your documents to highlight inconsistencies before you submit to the consulate.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6 text-center text-zinc-500">
        <p>© {new Date().getFullYear()} DocHub. Streamlining US Visa Applications.</p>
      </footer>
    </div>
  );
}
