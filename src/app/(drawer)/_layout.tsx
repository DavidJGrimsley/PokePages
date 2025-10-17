import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Pressable, Text, Platform, View } from 'react-native';
import { HeaderButton, HeaderTitle, headerStyle } from 'components/UI/HeaderComponents';
import { theme } from 'constants/style/theme';
import { useUserAge } from '~/hooks/useUserAge';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
const iconSize = isMobile ? 24 : 32;

const DrawerLayout = () => {
  const { shouldShowSocialTab, isLoggedIn } = useUserAge();

  // Custom component for social drawer label
  const SocialDrawerLabel = (props: { color: string }) => {
    const { color } = props;
    const shouldShowRestriction = isLoggedIn && !shouldShowSocialTab;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{
          fontFamily: theme.fontFamilies.copy,
          fontSize: theme.fontSizes.lg,
          fontWeight: theme.fontWeights.medium,
          marginLeft: theme.spacing.md,
          color: color,
        }}>
          Social
        </Text>
        {shouldShowRestriction && (
          <Text style={{
            fontSize: 12,
            color: theme.colors.light.text, // Use inactive color for restriction
            marginLeft: theme.spacing.xs, // Use theme spacing for correct gap
          }}>
            (13+)
          </Text>
        )}
      </View>
    );
  };

  // ✅ Memoize the drawer toggle to prevent unnecessary re-renders
  const DrawerToggle = () => {
    const navigation = useNavigation();
    return (
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={{
          margin: theme.spacing.sm,
          backgroundColor: theme.colors.light.secondary,
          borderRadius: theme.borderRadius.md,
          paddingHorizontal: isMobile ? theme.spacing.md : theme.spacing.lg,
          paddingVertical: isMobile ? theme.spacing.sm : theme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 40,
          minHeight: 40,
        }}
      >
        <Text 
          style={{
            fontFamily: theme.fontFamilies.callToAction, // Use PressStart2P (CTA font)
            fontSize: isMobile ? 18 : 24, // Increased mobile size for visibility
            fontWeight: theme.fontWeights.regular,
            color: theme.colors.light.primary, // Use dark purple for better contrast
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          PP
        </Text>
      </Pressable>
    );
  };
  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: theme.colors.light.brown, // Active item color (moss green)
        drawerInactiveTintColor: theme.colors.light.accent, // Inactive item color (brown)
        drawerActiveBackgroundColor: theme.colors.light.accent, // Active item background (lavender)
        drawerInactiveBackgroundColor: theme.colors.light.background, // Inactive item background
        drawerStyle: {
          backgroundColor: theme.colors.light.white, // Drawer background (white)
          // width: isMobile ? '90%' : 500, // Full width on mobile, fixed width on desktop
          height: '90%', // Full height
        },
        drawerLabelStyle: {
          fontFamily: theme.fontFamilies.copy, // Use Roboto for drawer labels
          fontSize: theme.fontSizes.lg, // Large but reasonable font size
          fontWeight: theme.fontWeights.medium, // Medium weight
          marginLeft: theme.spacing.md, // Add space between icon and label
        },
        drawerItemStyle: {
          marginVertical: theme.spacing.xs, // Add vertical spacing between items
          paddingVertical: theme.spacing.sm, // Add padding within each item
          borderRadius: theme.borderRadius.md, // Round the active background
        },
        drawerContentStyle: {
          // paddingVertical: theme.spacing.xl, // Add padding to the whole drawer content
        },
        
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: () => <HeaderTitle title="Poké Pages" />,
          drawerLabel: 'Home',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={iconSize} color={color} />
          ),
          headerLeft: () => <DrawerToggle />, 
          headerRight: () => (
            <Link href="/appInfo" asChild>
              <HeaderButton iconName="info-circle" />
            </Link>
          ),
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
        }}
      />
      <Drawer.Screen
        name="social"
        options={{
          headerTitle: () => <HeaderTitle title="Community" />,
          drawerLabel: SocialDrawerLabel,
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="person-outline" size={iconSize} color={color} />
          ),
          headerLeft: () => <DrawerToggle />, 
          headerRight: () => (
            <Link href="/editProfile" asChild>
              <HeaderButton iconName="user-circle" />
            </Link>
          ),
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
          drawerItemStyle: {
            display: 'none'
          }
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          headerTitle: () => <HeaderTitle title="Events" />,
          drawerLabel: 'Events',
          headerShown: true,
          headerLeft: () => <DrawerToggle />, 
          headerRight: () => (
            <Link href="/editProfile" asChild>
              <HeaderButton iconName="user-circle" />
            </Link>
          ),
          drawerIcon: ({ size, color }) => (
            <Ionicons name="trophy-outline" size={iconSize} color={color} />
          ),
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
        }}
      />
      <Drawer.Screen
        name="resources"
        options={{
          headerTitle: () => <HeaderTitle title="Resources" />,
          drawerLabel: 'Tools',
          headerLeft: () => <DrawerToggle />, 
          headerRight: () => (
            <Link href="/editProfile" asChild>
              <HeaderButton iconName="user-circle" />
            </Link>
          ),
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="build" size={iconSize} color={color} />
          ),
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
        }}
      />
      <Drawer.Screen
        name="guides"
        options={{
          headerTitle: () => <HeaderTitle title="Game Guide" />,
          drawerLabel: 'Games',
          headerLeft: () => <DrawerToggle />, 
          headerRight: () => (
            <Link href="/editProfile" asChild>
              <HeaderButton iconName="user-circle" />
            </Link>
          ),
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="book" size={iconSize} color={color} />
          ),
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
