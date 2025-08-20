'use client';
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 min-h-full bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-100">
            Welcome to EASHL Leagues
          </h1>
          
          <div className="text-center text-xl text-blue-200 mb-12">
            Your ultimate destination for tracking and managing NHL 25 EASHL league statistics
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:transform hover:scale-105 transition-transform">
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Real-Time Stats</h3>
              <p className="text-gray-300">
                Track player and team performance with live updates and detailed statistical analysis
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:transform hover:scale-105 transition-transform">
              <h3 className="text-xl font-semibold mb-3 text-blue-300">League Management</h3>
              <p className="text-gray-300">
                Easily organize and manage your EASHL leagues with our comprehensive tools
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:transform hover:scale-105 transition-transform">
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Team Analytics</h3>
              <p className="text-gray-300">
                Deep dive into team statistics and performance metrics to improve your game
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/leagues" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Explore Leagues
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}