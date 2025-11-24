export interface StrategyPic {
  src: string;
  caption: string;
}

export interface StrategySection {
  title: string;
  content: string;
  bullets: string[];
  youtubeIDs?: string[];
  pics?: StrategyPic[];
}

export interface Strategy {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  sections: StrategySection[];
  youtubeIDs?: string[];
}

export type StrategiesConfig = Record<string, Strategy>;
