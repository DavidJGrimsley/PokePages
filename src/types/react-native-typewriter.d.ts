declare module 'react-native-typewriter' {
  import { Component, ReactNode } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  export interface DelayMapItem {
    at: string | number | RegExp;
    delay: number;
  }

  export interface TypeWriterProps {
    children: ReactNode;
    delayMap?: DelayMapItem[];
    fixed?: boolean;
    initialDelay?: number;
    maxDelay?: number;
    minDelay?: number;
    onTyped?: () => void;
    onTypingEnd?: () => void;
    style?: TextStyle | ViewStyle;
    typing?: -1 | 0 | 1;
  }

  export default class TypeWriter extends Component<TypeWriterProps> {}
}