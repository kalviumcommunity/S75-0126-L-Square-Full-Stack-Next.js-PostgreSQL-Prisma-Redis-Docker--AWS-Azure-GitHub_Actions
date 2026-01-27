import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = params;

  // Check if user is authenticated
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect('/login');
  }

  // Mock user data
  const user = {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    role: id === "1" ? "admin" : "user",
    createdAt: new Date().toLocaleDateString()
  };

  return (
    <main className="mt-10">
      <div className="mb-6">
        <Link href="/users" className="text-blue-600 hover:underline">
          ← Back to Users List
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <div className="border p-6 rounded-lg bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Created:</strong> {user.createdAt}</p>
          </div>
        </div>
      </div>
    </main>
  );
}