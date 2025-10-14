import { ScreenContent } from 'components/UI/ScreenContent';
import EnhancedSignIn from 'components/Auth/EnhancedSignIn';

export default function SignInScreen() {
  return (
    <ScreenContent path="app/sign-in.tsx" title="Welcome to Poke Pages">
      <EnhancedSignIn />
    </ScreenContent>
  );
}
