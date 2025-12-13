import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useWaitlistStatus = (uid: string | undefined) => {
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkWaitlistStatus = async () => {
      if (!uid) {
        console.log('[Waitlist] No UID provided');
        setIsAccepted(false);
        setLoading(false);
        return;
      }

      try {
        console.log('[Waitlist] Checking status for UID:', uid);
        // Check if user document exists in acceptedUsers collection
        const userDocRef = doc(db, 'acceptedUsers', uid);
        const userDoc = await getDoc(userDocRef);
        
        const accepted = userDoc.exists();
        console.log('[Waitlist] Document exists:', accepted);
        if (accepted) {
          console.log('[Waitlist] Document data:', userDoc.data());
        }
        
        setIsAccepted(accepted);
      } catch (error) {
        console.error('[Waitlist] Error checking waitlist status:', error);
        setIsAccepted(false);
      } finally {
        setLoading(false);
      }
    };

    checkWaitlistStatus();
  }, [uid]);

  return { isAccepted, loading };
};
