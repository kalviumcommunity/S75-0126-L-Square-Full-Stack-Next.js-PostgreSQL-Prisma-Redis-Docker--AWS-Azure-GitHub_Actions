'use client';

import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

const SWRProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,      // Refetch when window gains focus
        revalidateOnReconnect: true,  // Refetch on network reconnect
        refreshInterval: 0,           // Disable auto-refresh by default
        errorRetryCount: 3,           // Retry failed requests up to 3 times
        errorRetryInterval: 5000,     // Wait 5 seconds between retries
        // Custom retry logic
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
          // Only retry for 4xx and 5xx errors, not for 404s or 401s
          if (error.message.includes('404') || error.message.includes('401')) return;
          if (retryCount >= 3) return;
          
          // Exponential backoff: 1s, 2s, 4s
          const retryInterval = Math.min(5000, 1000 * 2 ** retryCount);
          setTimeout(() => revalidate({ retryCount: retryCount + 1 }), retryInterval);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRProvider;