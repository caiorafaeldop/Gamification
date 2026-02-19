// import { useUser, useClerk } from '@clerk/clerk-react';

// export const useAuth = () => {
//   const { isSignedIn, user, isLoaded } = useUser();
//   const { signOut } = useClerk();

//   return {
//     isAuthenticated: !!isSignedIn,
//     user: user,
//     logout: () => signOut(),
//     isLoaded
//   };
// };

export const useAuth = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    isAuthenticated: !!token,
    user: user,
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    },
    isLoaded: true
  };
};
