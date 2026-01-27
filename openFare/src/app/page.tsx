export default function Home() {
  return (
    <main className="flex flex-col items-center mt-10">
      <h1 className="text-3xl font-bold mb-4">Welcome to OpenFare 🚌</h1>
      <p className="text-lg mb-4">Navigate to different sections using the menu above.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="border p-4 rounded-lg bg-white shadow-sm">
          <h3 className="font-semibold">Public Routes</h3>
          <p>/, /login</p>
        </div>
        <div className="border p-4 rounded-lg bg-white shadow-sm">
          <h3 className="font-semibold">Protected Routes</h3>
          <p>/dashboard, /users/*</p>
        </div>
        <div className="border p-4 rounded-lg bg-white shadow-sm">
          <h3 className="font-semibold">Dynamic Routes</h3>
          <p>/users/[id]</p>
        </div>
      </div>
    </main>
  );
}