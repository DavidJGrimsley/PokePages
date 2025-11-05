import { Text, StyleProp, TextStyle } from "react-native";
import { cn } from "utils/cn";

type AppTextProps = {
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "heading";
  bold?: boolean;
  color?: "primary" | "secondary" | "tertiary";
  center?: boolean;
  className?: string;
  noMargin?: boolean;
  style?: StyleProp<TextStyle>;
};

export function AppText({
  children,
  size = "medium",
  bold = false,
  color = "primary",
  center = false,
  className,
  noMargin = false,
  style,
}: AppTextProps) {
  const sizeClass = (() => {
    switch (size) {
      case "small":
        return noMargin ? "text-sm" : "text-sm mb-2";
      case "large":
        return noMargin ? "text-lg" : "text-lg mb-4";
      case "heading":
        return noMargin ? "text-xl" : "text-xl mb-5";
      case "medium":
      default:
        return noMargin ? "text-base" : "text-base mb-3";
    }
  })();

  return (
    <Text
      style={style}
      className={cn(
        sizeClass,
        bold && "font-bold",
        color === "primary" && "text-app-text",
        color === "secondary" && "text-gray-500",
        color === "tertiary" && "text-gray-400",
        center && "text-center",
        className,
      )}
    >
      {children}
    </Text>
  );
}
