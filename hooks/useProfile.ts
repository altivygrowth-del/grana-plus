import { useUserStore } from '../store/userStore';

/**
 * Hook reativo para leitura e gerenciamento do perfil do usuário autenticado no Grana+.
 * Compartilha o estado global cached via Zustand para evitar chamadas duplicadas.
 */
export const useProfile = () => {
  const user = useUserStore((state) => state.user);
  const authUser = useUserStore((state) => state.authUser);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isLoading = useUserStore((state) => state.isLoadingAuth);
  const updateProfile = useUserStore((state) => state.updateProfile);

  return {
    profile: user,
    authUser,
    isAuthenticated,
    isLoading,
    updateProfile
  };
};

export default useProfile;
