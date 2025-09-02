import { ScreenContent } from '~/components/ScreenContent';
import Auth from '../components/Auth';


export default function SignInScreen() {
  return (
    <ScreenContent path="app/sign-in.tsx" title="Welcome to Poke Pages">
      <Auth />
    </ScreenContent>
  );
}
