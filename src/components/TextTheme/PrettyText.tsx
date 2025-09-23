import React from 'react';
import { Platform } from 'react-native';
import { BouncyText } from 'components/TextTheme/BouncyText';
import { MaskText } from 'components/TextTheme/MaskText';

const isWeb = Platform.OS === 'web';


export function PrettyText({ text }: { text: string }) {
  return isWeb ? (
      <BouncyText text={text} />
    ) : (
      <MaskText text={text} />
    );
}


