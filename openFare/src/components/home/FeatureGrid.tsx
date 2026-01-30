import { Zap, Globe, LayoutDashboard } from "lucide-react";

const features = [
  { title: "Edge Performance", icon: <Zap />, desc: "Sub-100ms global response" },
  { title: "Hybrid Routing", icon: <Globe />, desc: "Public & protected routes" },
  { title: "Modern Stack", icon: <LayoutDashboard />, desc: "Next.js + Prisma" },
];

export default function FeatureGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-20">
      {features.map((f) => (
        <div key={f.title}>
          <div className="text-blue-500 mb-2">{f.icon}</div>
          <h3 className="font-bold">{f.title}</h3>
          <p className="text-sm">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
