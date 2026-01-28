export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">OpenFare</span> 🚌
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Modern bus booking platform built with Next.js, PostgreSQL, Prisma, Redis, Docker, and deployed on AWS/Azure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105"
            >
              Get Started
            </a>
            <a 
              href="/dashboard" 
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-8 rounded-lg border-2 border-gray-300 transition duration-300"
            >
              View Dashboard
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Public Routes</h3>
            <p className="text-gray-600">Accessible to everyone without authentication</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">/, /login</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Protected Routes</h3>
            <p className="text-gray-600">Require authentication to access sensitive data</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">/dashboard, /users/*</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Dynamic Routes</h3>
            <p className="text-gray-600">Handle dynamic content with parameterized URLs</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">/users/[id]</span>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-3">
                <span className="text-2xl">⚛️</span>
              </div>
              <h3 className="font-semibold text-gray-900">Next.js 16</h3>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-3">
                <span className="text-2xl">🐘</span>
              </div>
              <h3 className="font-semibold text-gray-900">PostgreSQL</h3>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-3">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="font-semibold text-gray-900">Prisma ORM</h3>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900">Redis Cache</h3>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-500">
          <p>Built with ❤️ using modern web technologies</p>
        </div>
      </div>
    </main>
  );
}