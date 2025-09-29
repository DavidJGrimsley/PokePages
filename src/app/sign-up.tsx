import { ScreenContent } from 'components/UI/ScreenContent';
import SignUp from 'components/Auth/SignUp';

export default function SignUpScreen() {
  return (
    <ScreenContent path="app/sign-up.tsx" title="Welcome to Poke Pages">
      <SignUp />
    </ScreenContent>
  );
}
