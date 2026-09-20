import { saveOffline, getOfflineData, clearOfflineStore } from './offline-store';
import api from './api';

export const markAttendanceOffline = async (data: any) => {
  try {
    // Try online first
    await api.post('/attendance', data);
  } catch (err) {
    // Save offline if network fails
    await saveOffline('attendance', data);
    console.log('Saved offline — will sync when connected');
  }
};

export const syncOfflineAttendance = async () => {
  const offlineRecords = await getOfflineData('attendance');
  if (offlineRecords.length === 0) return;

  let synced = 0;
  for (const record of offlineRecords) {
    try {
      await api.post('/attendance', record);
      synced++;
    } catch (err) {}
  }

  if (synced === offlineRecords.length) {
    await clearOfflineStore('attendance');
  }

  return synced;
};
