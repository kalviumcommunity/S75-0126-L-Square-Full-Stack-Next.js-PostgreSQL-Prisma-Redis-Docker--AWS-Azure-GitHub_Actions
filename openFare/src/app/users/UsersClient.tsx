"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function UsersPage() {
  const { data, error, isLoading } = useSWR<User[]>("/api/users", fetcher);
  const router = useRouter();
  const { user: currentUser } = useAuth();

  if (error) {
    // Check if it's an authentication error
    if (error.message.includes("401")) {
      router.push('/login');
      return null;
    }
    return <p className="text-red-600 p-6">Failed to load users: {error.message}</p>;
  }

  if (isLoading) return <p className="p-6">Loading...</p>;

  const canCreate = currentUser?.role === 'ADMIN';
  const canDelete = currentUser?.role === 'ADMIN';
  const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  return (
    <main className="mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users List</h1>
        {canCreate && <AddUser />}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Role</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((user: User) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border">{user.id}</td>
                <td className="py-2 px-4 border">{user.name}</td>
                <td className="py-2 px-4 border">{user.email}</td>
                <td className="py-2 px-4 border">{user.role}</td>
                <td className="py-2 px-4 border">
                  <Link 
                    href={`/users/${user.id}`} 
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                  {canEdit && (
                    <button className="text-green-600 hover:underline ml-4">Edit</button>
                  )}
                  {canDelete && (
                    <button className="text-red-600 hover:underline ml-4">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// AddUser component for optimistic updates
function AddUser() {
  const { data, mutate } = useSWR<User[]>("/api/users", fetcher);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const addUser = async () => {
    if (!name || !email) return;
    setIsSubmitting(true);

    try {
      // Optimistic update
      const optimisticUser = { 
        id: Date.now(), 
        name, 
        email,
        createdAt: new Date().toISOString()
      };

      // Update cache optimistically
      mutate(
        [...(data || []), optimisticUser],
        false
      );

      // Make actual API call
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      const newUser = await response.json();
      
      // Update with the actual user from server
      mutate(); // Revalidate the data
      
      // Reset form
      setName("");
      setEmail("");
    } catch (err) {
      console.error("Error adding user:", err);
      // If there was an error, revert the optimistic update
      mutate(); // Re-fetch to restore correct data
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <input
        className="border px-2 py-1 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        disabled={isSubmitting}
      />
      <input
        className="border px-2 py-1 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={isSubmitting}
      />
      <button
        onClick={addUser}
        disabled={isSubmitting}
        className={`bg-blue-600 text-white px-3 py-1 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
      >
        {isSubmitting ? 'Adding...' : 'Add User'}
      </button>
    </div>
  );
}