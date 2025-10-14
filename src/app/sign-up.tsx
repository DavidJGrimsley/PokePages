import { ScreenContent } from 'components/UI/ScreenContent';
import EnhancedSignUp from 'components/Auth/EnhancedSignUp';

export default function SignUpScreen() {
  return (
    <ScreenContent path="app/sign-up.tsx" title="Welcome to Poke Pages">
      <EnhancedSignUp />
    </ScreenContent>
  );
}
