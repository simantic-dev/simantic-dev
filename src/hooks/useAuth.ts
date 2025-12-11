import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to check if user is authenticated
 * @returns boolean indicating if user is logged in
 */
export const useIsAuthenticated = (): boolean => {
  const { currentUser } = useAuth();
  return currentUser !== null;
};

/**
 * Custom hook to get user display info
 * @returns User display information or null
 */
export const useUserInfo = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  return {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    emailVerified: currentUser.emailVerified,
  };
};
