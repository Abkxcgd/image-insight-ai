import { Classifier } from "@/components/Classifier";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
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
      </main>
      <Footer />
    </div>
  );
}
