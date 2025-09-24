import { View, ScrollView } from 'react-native';
import { PrettyText } from 'components/TextTheme/PrettyText';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    <ScrollView className="flex-1" contentContainerClassName="items-center bg-app-background flex-grow justify-center py-6">
      <PrettyText text={title} />
      <View className="bg-app-secondary h-px my-6 w-4/5" />
      {children}
    </ScrollView>
  );
};

