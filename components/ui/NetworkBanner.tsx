'use client';
import { useNetwork } from '@/lib/use-network';
import { useEffect, useState } from 'react';
import { syncOfflineAttendance } from '@/lib/offline-attendance';

export default function NetworkBanner() {
  const isOnline = useNetwork();
  const [syncing, setSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  useEffect(() => {
    if (isOnline) {
      handleSync();
    }
  }, [isOnline]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const count = await syncOfflineAttendance();
      if (count && count > 0) setSyncedCount(count);
    } catch (err) {} finally {
      setSyncing(false);
    }
  };

  if (isOnline && syncedCount === 0) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 text-center text-sm py-2 px-4 ${
      isOnline ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
    }`}>
      {!isOnline && 'You are offline. Data will sync when connected.'}
      {isOnline && syncing && 'Syncing offline data...'}
      {isOnline && !syncing && syncedCount > 0 && `Synced ${syncedCount} offline record(s)`}
    </div>
  );
}
