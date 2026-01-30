"use client";

import PageShell from "@/components/layout/PageShell";
import HeaderSection from "@/components/home/HeaderSection";
import AuthCard from "@/components/home/AuthCard";
import AppearanceCard from "@/components/home/AppearanceCard";
import FeatureGrid from "@/components/home/FeatureGrid";

export default function Home() {
  return (
    <PageShell>
      <HeaderSection />

      <div className="grid md:grid-cols-12 gap-6 mb-20">
        <div className="md:col-span-7">
          <AuthCard />
        </div>
        <div className="md:col-span-5">
          <AppearanceCard />
        </div>
      </div>

      <FeatureGrid />

      <footer className="text-center text-sm opacity-60">
        Built with TypeScript & Tailwind • 2026 OpenFare
      </footer>
    </PageShell>
  );
}
