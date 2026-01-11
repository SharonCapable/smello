import { useAuthContext } from "@/components/firebase-auth-provider"

export function useAuth() {
    const { user, loading, signInWithGoogle, signOut } = useAuthContext()

    return {
        user,
        loading,
        signInWithGoogle,
        signOut,
        isSignedIn: !!user,
        isLoaded: !loading,
    }
}
