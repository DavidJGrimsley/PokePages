import { ComingSoon } from '~/components/ComingSoon';
import { ScreenContent } from '~/components/ScreenContent';


export default function SignInScreen() {
  return (
    <ScreenContent path="app/sign-in.tsx" title="Sign In">
      <ComingSoon />
    </ScreenContent>
  );
}
