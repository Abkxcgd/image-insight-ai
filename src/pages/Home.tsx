import { AboutModel } from "@/components/AboutModel";
import { Classifier } from "@/components/Classifier";
import { FAQ } from "@/components/FAQ";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HistoryPanel } from "@/components/HistoryPanel";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";

// Main landing page — composes all sections of the app.
export function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Classifier />
        <Features />
        <HowItWorks />
        <AboutModel />
        <HistoryPanel />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
