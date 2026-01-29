"use client";

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}

const SWRDemoPage = () => {
  // SWR for fetching users
  const { data: users, error, isLoading, isValidating } = useSWR<User[]>('/api/users', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 10000, // Refresh every 10 seconds
  });

  // State for adding new user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add user with optimistic update
  const addUser = async () => {
    if (!name || !email) return;
    setIsSubmitting(true);

    try {
      // Optimistic update
      const optimisticUser = {
        id: Date.now(),
        name,
        email,
        createdAt: new Date().toISOString(),
      };

      // Update cache optimistically
      mutate(
        '/api/users',
        [...(users || []), optimisticUser],
        false
      );

      // Make actual API call
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      const newUser = await response.json();

      // Revalidate to get actual data from server
      mutate('/api/users');

      // Reset form
      setName('');
      setEmail('');
    } catch (err) {
      console.error('Error adding user:', err);
      // If there was an error, revert the optimistic update
      mutate('/api/users');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user with optimistic update
  const deleteUser = async (id: number) => {
    // Optimistic update
    mutate(
      '/api/users',
      users?.filter(user => user.id !== id),
      false
    );

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Revalidate after successful deletion
      mutate('/api/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      // Revert optimistic update if there was an error
      mutate('/api/users');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">SWR Demo - Client-Side Data Fetching</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">SWR Key Structure</h2>
        <p><strong>API Endpoint:</strong> /api/users</p>
        <p><strong>SWR Key:</strong> /api/users</p>
        <p><strong>Revalidation:</strong> On focus, on reconnect, manual refresh</p>
      </div>

      {/* Add User Form */}
      <div className="mb-8 p-4 bg-white border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New User (Optimistic Update)</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="border px-3 py-2 rounded flex-grow"
            disabled={isSubmitting}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border px-3 py-2 rounded flex-grow"
            disabled={isSubmitting}
          />
          <button
            onClick={addUser}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Adding...' : 'Add User'}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="p-4 bg-white border rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Users List</h2>
          <div className="flex items-center space-x-2">
            {isValidating && <span className="text-sm text-blue-600">Revalidating...</span>}
            <button
              onClick={() => mutate('/api/users')}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {isLoading && <p>Loading users...</p>}
        {error && <p className="text-red-600">Error loading users: {(error as Error).message}</p>}

        {users && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">ID</th>
                  <th className="py-2 px-4 border">Name</th>
                  <th className="py-2 px-4 border">Email</th>
                  <th className="py-2 px-4 border">Created At</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-2 px-4 border">{user.id}</td>
                    <td className="py-2 px-4 border">{user.name}</td>
                    <td className="py-2 px-4 border">{user.email}</td>
                    <td className="py-2 px-4 border">
                      {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && users && users.length === 0 && (
          <p>No users found. Add some users to see them here.</p>
        )}
      </div>

      {/* SWR Features Explanation */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Caching Benefits</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Returns cached data immediately</li>
            <li>Background revalidation</li>
            <li>Reduces API calls</li>
            <li>Improves UX significantly</li>
          </ul>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Optimistic Updates</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>UI updates instantly</li>
            <li>Server sync after request</li>
            <li>Better perceived performance</li>
            <li>Error recovery possible</li>
          </ul>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Revalidation Strategies</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>On window focus</li>
            <li>On network reconnect</li>
            <li>Manual refresh</li>
            <li>Auto refresh (if configured)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SWRDemoPage;