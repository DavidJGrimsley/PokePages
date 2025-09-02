import { ScreenContent } from '~/components/ScreenContent';
import Account from '~/components/Account';
import { useAuthStore } from '~/utils/authStore';

export default function SignUpScreen() {
  const { session } = useAuthStore();
  
  // This screen should only be accessible when logged in but profile incomplete
  if (!session) {
    return (
      <ScreenContent path="app/sign-up.tsx" title="Welcome to Poke Pages">
        <div>Please sign in first to complete your profile.</div>
      </ScreenContent>
    );
  }

  return (
    <ScreenContent path="app/sign-up.tsx" title="Complete Your Profile">
      <Account session={session} isSignUp={true} />
    </ScreenContent>
  );
}
