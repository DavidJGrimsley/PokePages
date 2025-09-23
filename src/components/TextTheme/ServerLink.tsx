import { ExternalLink } from 'components/TextTheme/ExternalLink';
import { ThemedText } from 'components/TextTheme/ThemedText';

export function ServerLink() {
  return (
    <ExternalLink href="http://108.175.12.95:8000">
      <ThemedText type="defaultSemiBold" className="text-blue-500 underline">
        108.175.12.95:8000
      </ThemedText>
    </ExternalLink>
  );
}
