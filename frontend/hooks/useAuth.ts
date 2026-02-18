import { useUser, useClerk } from '@clerk/clerk-react';

export const useAuth = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();

  return {
    isAuthenticated: !!isSignedIn,
    user: user,
    logout: () => signOut(),
    isLoaded
  };
};
