import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Pressable, Text, Platform } from 'react-native';
import { HeaderButton, HeaderTitle, styles } from '../../components/HeaderComponents';
import { theme } from '../../../constants/style/theme';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
const iconSize = isMobile ? 24 : 32;

const DrawerLayout = () => {
  // ✅ Memoize the drawer toggle to prevent unnecessary re-renders
  const DrawerToggle = () => {
    const navigation = useNavigation();
    return (
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={isMobile ? styles.mobileDrawerStyle : styles.desktopDrawerStyle}
      >
        <Text style={styles.drawerToggleText} numberOfLines={1}>
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
          headerStyle: styles.headerStyle,
        }}
      />
      <Drawer.Screen
        name="social"
        options={{
          headerTitle: () => <HeaderTitle title="Community" />,
          drawerLabel: 'Social',
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="person-outline" size={iconSize} color={color} />
          ),
          headerLeft: () => <DrawerToggle />, 
          headerRight: () => (
            <Link href="/editProfile" asChild>
              <HeaderButton iconName="user" />
            </Link>
          ),
          headerTitleAlign: 'center',
          headerStyle: styles.headerStyle,
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
            <Link href="/eventDisclaimer" asChild>
              <HeaderButton iconName="calendar" />
            </Link>
          ),
          drawerIcon: ({ size, color }) => (
            <Ionicons name="trophy-outline" size={iconSize} color={color} />
          ),
          headerTitleAlign: 'center',
          headerStyle: styles.headerStyle,
        }}
      />
      <Drawer.Screen
        name="resources"
        options={{
          headerTitle: () => <HeaderTitle title="Resources" />,
          drawerLabel: 'Tools',
          headerLeft: () => <DrawerToggle />, 
          headerRight: () => (
            <Link href="/resourcesInfo" asChild>
              <HeaderButton iconName="wrench" />
            </Link>
          ),
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="build" size={iconSize} color={color} />
          ),
          headerTitleAlign: 'center',
          headerStyle: styles.headerStyle,
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;