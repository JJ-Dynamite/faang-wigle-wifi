import { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Global WiFi wardriving map</title>
        <meta name="description" content="Global WiFi wardriving map" />
      </Head>
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8">Global WiFi wardriving map</h1>
          <p className="text-gray-400 text-lg">
            Built with Rust (Axum) + Next.js
          </p>
          <div className="mt-8 p-6 bg-gray-900 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="space-y-2 text-gray-300">
              <li>✓ High-performance Rust backend</li>
              <li>✓ Modern Next.js frontend</li>
              <li>✓ Type-safe API contracts</li>
              <li>✓ Production-ready CI/CD</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
