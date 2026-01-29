import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Demo Page</h1>
      <p className="mb-6">This is a demo page for testing various features.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">SWR Demo</h2>
          <p className="mb-4">Experience client-side data fetching with SWR (Stale-While-Revalidate).</p>
          <Link 
            href="/demo/swr-demo"
            className="text-blue-600 hover:underline font-medium"
          >
            Go to SWR Demo
          </Link>
        </div>
        
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Users Page</h2>
          <p className="mb-4">View and manage users with SWR-powered client-side rendering.</p>
          <Link 
            href="/users"
            className="text-blue-600 hover:underline font-medium"
          >
            Go to Users Page
          </Link>
        </div>
      </div>
    </main>
  );
}