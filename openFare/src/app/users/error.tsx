// app/users/error.tsx
"use client";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-semibold text-red-600">
        Something went wrong
      </h2>

      <p className="text-gray-600 mt-2">
        {error.message || "Failed to load users"}
      </p>

      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}
