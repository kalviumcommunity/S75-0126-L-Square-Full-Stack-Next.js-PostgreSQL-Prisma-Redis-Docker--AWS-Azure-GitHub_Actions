import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  // Check if user is authenticated
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect('/login');
  }

  return (
    <main className="mt-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-6 rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <p>You are logged in and can access this protected page.</p>
        </div>
        <div className="border p-6 rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <p>Total Users: 0</p>
          <p>Active Bookings: 0</p>
          <p>Pending Refunds: 0</p>
        </div>
      </div>
    </main>
  );
}