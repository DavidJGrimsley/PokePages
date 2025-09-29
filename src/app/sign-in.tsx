import { ScreenContent } from 'components/UI/ScreenContent';
import SignIn from 'components/Auth/SignIn';


export default function SignInScreen() {
  return (
    <ScreenContent path="app/sign-in.tsx" title="Welcome to Poke Pages">
      <SignIn />
    </ScreenContent>
  );
}
