import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { ThemedText } from 'components/TextTheme/ThemedText';
import { ThemedView } from 'components/TextTheme/ThemedView';
import { Collapsible } from 'components/UI/Collapsible';
import { IconSymbol } from 'components/UI/IconSymbol';
import { useColorScheme } from '~/hooks/useColorScheme';
import colors from 'constants/style/colors';

interface ComponentTitleProps {
  title: string;
  description?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
}

/**
 * A development component that displays the name and description of components being showcased.
 * Enhanced version with themed colors and better styling.
 */
export const ComponentTitle: React.FC<ComponentTitleProps> = ({
  title,
  description,
  variant = 'primary',
  size = 'medium'
}) => {
  const variantStyles = {
    primary: 'bg-app-primary/10 border-app-primary/20',
    secondary: 'bg-app-secondary/10 border-app-secondary/20',
    accent: 'bg-app-accent/10 border-app-accent/20'
  };

  const sizeStyles = {
    small: 'px-2 py-1',
    medium: 'px-3 py-2',
    large: 'px-4 py-3'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <ThemedView className={`rounded-app border ${variantStyles[variant]} ${sizeStyles[size]} mb-4`}>
      <ThemedText className={`font-roboto-mono ${textSizes[size]} font-semibold mb-1`} type="defaultSemiBold">
        📦 {title}
      </ThemedText>
      {description && (
        <ThemedText className="text-xs text-app-muted leading-relaxed">
          {description}
        </ThemedText>
      )}
    </ThemedView>
  );
};

/**
 * A wrapper component for showcasing individual components in the template
 */
interface ComponentShowcaseProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
}

export const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({
  title,
  description,
  children,
  variant = 'primary'
}) => {
  return (
    <ThemedView className="mb-6">
      <ComponentTitle 
        title={title} 
        description={description} 
        variant={variant} 
      />
      <ThemedView className="bg-app-surface/50 rounded-app p-4 border border-app-border">
        {children}
      </ThemedView>
    </ThemedView>
  );
};

/**
 * Main Dev Components Screen - showcases all available components
 */
export function DevComponents() {
  const colorScheme = useColorScheme() ?? 'light';
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const [animatedCollapsibleOpen, setAnimatedCollapsibleOpen] = useState(false);
  
  const currentColors = colors[colorScheme];

  return (
    <ScrollView className="flex-1 bg-app-background">
      <ThemedView className="p-4">
        <ComponentTitle 
          title="🛠️ Development Components" 
          description="Interactive showcase of all available UI components in this template"
          variant="primary"
          size="large"
        />

        {/* Themed Components */}
        <ComponentShowcase 
          title="Themed Text & Views" 
          description="Text and view components that adapt to light/dark themes"
        >
          <ThemedView className="space-y-3">
            <ThemedText type="title">This is a title</ThemedText>
            <ThemedText type="subtitle">This is a subtitle</ThemedText>
            <ThemedText type="defaultSemiBold">This is semibold text</ThemedText>
            <ThemedText type="link">This is a link</ThemedText>
            <ThemedText>This is default text</ThemedText>
            
            <ThemedView className="mt-4 p-3 bg-app-surface rounded-lg">
              <ThemedText className="text-app-muted">Themed view with surface background</ThemedText>
            </ThemedView>
          </ThemedView>
        </ComponentShowcase>

        {/* Collapsible Components */}
        <ComponentShowcase 
          title="Collapsible Components" 
          description="Expandable content with smooth animations"
        >
          <ThemedView className="space-y-4">
            <Collapsible
              title="Simple Collapsible"
              isOpen={collapsibleOpen}
              onToggle={setCollapsibleOpen}
            >
              <ThemedText className="text-app-muted">
                This is a simple collapsible component that can be toggled open and closed.
                Perfect for FAQ sections, detailed descriptions, or any content that needs
                to be hidden by default.
              </ThemedText>
            </Collapsible>

            <Collapsible
              title="Animated Collapsible"
              isOpen={animatedCollapsibleOpen}
              onToggle={setAnimatedCollapsibleOpen}
              animatedOpen={true}
            >
              <ThemedView className="space-y-2">
                <ThemedText className="text-app-success font-semibold">✨ Smooth Animations</ThemedText>
                <ThemedText className="text-app-muted">
                  This collapsible uses advanced animations with scale, rotation, and opacity effects.
                  Great for creating delightful user experiences.
                </ThemedText>
                <ThemedView className="flex-row space-x-2 mt-3">
                  <View className="bg-app-primary w-6 h-6 rounded" />
                  <View className="bg-app-secondary w-6 h-6 rounded" />
                  <View className="bg-app-accent w-6 h-6 rounded" />
                </ThemedView>
              </ThemedView>
            </Collapsible>
          </ThemedView>
        </ComponentShowcase>

        {/* Color Palette */}
        <ComponentShowcase 
          title="Color Palette" 
          description="Current theme colors and their usage"
        >
          <ThemedView>
            <ThemedText type="subtitle" className="mb-3">Primary Colors</ThemedText>
            <View className="flex-row flex-wrap mb-4">
              <ColorSwatch color="bg-app-primary" label="Primary" />
              <ColorSwatch color="bg-app-secondary" label="Secondary" />
              <ColorSwatch color="bg-app-accent" label="Accent" />
            </View>

            <ThemedText type="subtitle" className="mb-3">Status Colors</ThemedText>
            <View className="flex-row flex-wrap mb-4">
              <ColorSwatch color="bg-app-success" label="Success" />
              <ColorSwatch color="bg-app-warning" label="Warning" />
              <ColorSwatch color="bg-app-error" label="Error" />
              <ColorSwatch color="bg-app-info" label="Info" />
            </View>

            <ThemedText type="subtitle" className="mb-3">Surface Colors</ThemedText>
            <View className="flex-row flex-wrap">
              <ColorSwatch color="bg-app-surface" label="Surface" />
              <ColorSwatch color="bg-app-muted" label="Muted" />
              <ColorSwatch color="bg-app-border" label="Border" />
            </View>
          </ThemedView>
        </ComponentShowcase>

        {/* Typography Showcase */}
        <ComponentShowcase 
          title="Typography Scale" 
          description="Available text styles and their usage"
        >
          <ThemedView className="space-y-2">
            <ThemedText type="title" className="text-app-primary">Title Text (Large, Bold)</ThemedText>
            <ThemedText type="subtitle" className="text-app-secondary">Subtitle Text (Medium, Bold)</ThemedText>
            <ThemedText type="defaultSemiBold">Semi-bold Text (Regular, SemiBold)</ThemedText>
            <ThemedText type="link" className="text-app-primary">Link Text (Regular, Link Color)</ThemedText>
            <ThemedText>Default Body Text (Regular, Normal)</ThemedText>
            <ThemedText className="text-app-muted text-sm">Small Muted Text (Small, Muted)</ThemedText>
          </ThemedView>
        </ComponentShowcase>

        {/* Parallax Components Info */}
        <ComponentShowcase 
          title="Parallax Scroll Components" 
          description="Advanced animated scroll views with multi-layer parallax effects"
        >
          <ThemedView className="space-y-4">
            <ThemedView className="bg-app-surface p-3 rounded-lg">
              <ThemedText type="defaultSemiBold" className="text-app-primary mb-2">ParallaxScrollView</ThemedText>
              <ThemedText className="text-app-muted text-sm mb-2">
                Basic parallax with header image and smooth scroll animations.
              </ThemedText>
              <ThemedText className="text-app-muted text-xs">
                Props: headerImage, headerBackgroundColor
              </ThemedText>
            </ThemedView>

            <ThemedView className="bg-app-surface p-3 rounded-lg">
              <ThemedText type="defaultSemiBold" className="text-app-primary mb-2">TeamParallaxScrollView</ThemedText>
              <ThemedText className="text-app-muted text-sm mb-2">
                Advanced parallax with floating elements, background images, and dev icons.
              </ThemedText>
              <ThemedText className="text-app-muted text-xs">
                Props: headerBackgroundColor, backgroundImage, floatingElement
              </ThemedText>
            </ThemedView>

            <ThemedView className="bg-app-surface p-3 rounded-lg">
              <ThemedText type="defaultSemiBold" className="text-app-primary mb-2">MultiLayerParallaxScrollView</ThemedText>
              <ThemedText className="text-app-muted text-sm mb-2">
                Multi-layer parallax with customizable background, title, and floating elements.
              </ThemedText>
              <ThemedText className="text-app-muted text-xs">
                Props: headerBackgroundColor, backgroundGrid, titleElement, floatingElement, title
              </ThemedText>
            </ThemedView>

            <ThemedView className="bg-app-warning/10 p-3 rounded-lg border border-app-warning/30">
              <ThemedText className="text-app-warning text-sm font-semibold">📱 Usage Tip</ThemedText>
              <ThemedText className="text-app-muted text-sm mt-1">
                These components work best as full-screen containers. See the actual implementation
                in your app&apos;s tab screens for complete examples.
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ComponentShowcase>

        {/* Component Usage Guidelines */}
        <ComponentShowcase 
          title="Component Guidelines" 
          description="Best practices for using these components"
        >
          <ThemedView className="space-y-3">
            <GuidelineItem 
              icon="checkmark.circle.fill" 
              iconColor={currentColors.text}
              title="Theme Consistency" 
              description="All components automatically adapt to light/dark themes using useColorScheme hook."
            />
            <GuidelineItem 
              icon="paintbrush.fill" 
              iconColor={currentColors.text}
              title="NativeWind Integration" 
              description="Components use Tailwind CSS classes (app-primary, app-surface, etc.) for consistent styling."
            />
            <GuidelineItem 
              icon="arrow.up.right.square.fill" 
              iconColor={currentColors.accent}
              title="Parallax Performance" 
              description="Parallax components use react-native-reanimated for 60fps smooth animations."
            />
            <GuidelineItem 
              icon="gear" 
              iconColor={currentColors.secondary}
              title="Customization" 
              description="Modify colors.ts and tailwind.config.js to customize the design system."
            />
          </ThemedView>
        </ComponentShowcase>
      </ThemedView>
    </ScrollView>
  );
}

/**
 * Color Swatch Component
 */
function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <ThemedView className="items-center mr-4 mb-2">
      <View className={`w-12 h-12 ${color} rounded-lg border border-app-border mb-1`} />
      <ThemedText className="text-app-muted text-xs">{label}</ThemedText>
    </ThemedView>
  );
}

/**
 * Guideline Item Component
 */
function GuidelineItem({ 
  icon, 
  iconColor, 
  title, 
  description 
}: { 
  icon: string; 
  iconColor: string; 
  title: string; 
  description: string; 
}) {
  return (
    <ThemedView className="flex-row items-start">
      <View className="mr-3 mt-0.5">
        <IconSymbol name={icon} size={16} color={iconColor} weight="medium" />
      </View>
      <ThemedView className="flex-1">
        <ThemedText type="defaultSemiBold" className="mb-1">{title}</ThemedText>
        <ThemedText className="text-app-muted text-sm">{description}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}
