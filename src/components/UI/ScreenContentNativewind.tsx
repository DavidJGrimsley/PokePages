import { Text, View, ScrollView } from 'react-native';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    <ScrollView className="flex-1">
      <View className="items-center bg-purple-100 flex-grow justify-center py-6">
        <Text className="text-xl font-medium text-black">{title}</Text>
        <View className="bg-purple-300 h-px my-6 w-4/5" />
        {children}
      </View>
    </ScrollView>
  );
};
