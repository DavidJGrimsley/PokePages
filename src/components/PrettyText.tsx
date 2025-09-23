import React from 'react';
import { Platform } from 'react-native';
import { BouncyText } from './BouncyText';
import { MaskText } from './MaskText';

const isWeb = Platform.OS === 'web';


export function PrettyText({ text }: { text: string }) {
  return (
      <MaskText text={text} />
    );
  // return isWeb ? (
  //     <BouncyText text={text} />
  //   ) : (
  //     <MaskText text={text} />
  //   );
}


