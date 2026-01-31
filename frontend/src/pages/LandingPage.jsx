import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ClothesOptions from "../components/ClothesOptions";
import HowItWorks from "../components/HowItWorks";
import Benefits from "../components/Benefits";
import Footer from "../components/Footer";

export default function LandingPage() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <ClothesOptions />
        <HowItWorks />
        <Benefits />
      </main>
      <Footer />
    </div>
  );
}
