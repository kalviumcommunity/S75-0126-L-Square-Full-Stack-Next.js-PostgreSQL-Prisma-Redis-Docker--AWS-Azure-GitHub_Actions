'use client';

import { useSWRConfig } from 'swr';

const SWRStats = () => {
  const { cache, mutate } = useSWRConfig();

  // Only show stats in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Count cached items
  const cacheSize = cache ? Array.from(cache.keys()).length : 0;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-sm z-50">
      <div>SWR Cache Stats</div>
      <div>Cached Keys: {cacheSize}</div>
      <button 
        onClick={() => {
          // Clear cache
          if (cache instanceof Map) {
            cache.clear();
          }
          // Trigger global revalidation
          mutate(undefined);
        }}
        className="mt-1 px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
      >
        Clear Cache
      </button>
    </div>
  );
};

export default SWRStats;