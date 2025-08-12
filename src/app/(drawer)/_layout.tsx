
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Pressable, Image } from 'react-native';
import { HeaderButton } from '../../components/HeaderButton';

const DrawerLayout = () => {
  const DrawerToggle = () => {
    const navigation = useNavigation();
    return (
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={{ marginHorizontal: 16 }}
      >
        <Image
          source={require("../../../assets/PP_Icon.png")}
          style={{ width: 32, height: 32 }}
        />
      </Pressable>
    );
  };

  // Default React Navigation header height is 56
  const headerHeight = 56 * 0.9;
  const mainHeaderColor = '#b39ddb'; // Light purple, darker than lavender
  console.log('Made it to DrawerLayout');
  return (
    <Drawer>
        <Drawer.Screen
          name="index"
          options={{
            headerTitle: 'Poké Pages',
            drawerLabel: 'Home',
            drawerIcon: ({ size, color }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
            headerLeft: () => <DrawerToggle />, 
            headerRight: () => (
              <Link href="/appInfo" asChild>
                <HeaderButton />
              </Link>
            ),
            headerStyle: { height: headerHeight, backgroundColor: mainHeaderColor },
          }}
          />
        <Drawer.Screen
          name="social"
          options={{
            headerTitle: 'Social',
            drawerLabel: 'Community',
            drawerIcon: ({ size, color }) => (
              <MaterialIcons name="person-outline" size={size} color={color} />
            ),
            headerLeft: () => <DrawerToggle />, 
            headerRight: () => (
              <Link href="/editProfile" asChild>
                <HeaderButton />
              </Link>
            ),
            headerStyle: { height: headerHeight, backgroundColor: mainHeaderColor },
          }}
        />
      <Drawer.Screen
        name="events"
        options={{
          headerTitle: 'Pokemon Events',
          drawerLabel: 'Events',
          headerShown: true,
          headerLeft: () => <DrawerToggle />, 
          drawerIcon: ({ size, color }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
          headerStyle: { height: headerHeight, backgroundColor: mainHeaderColor },
        }}
      />
      <Drawer.Screen
        name="resources"
        options={{
          headerTitle: 'Resources',
          drawerLabel: 'Resources',
          // headerShown: false,
          headerLeft: () => <DrawerToggle />, 
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="build" size={size} color={color} />
          ),
          headerStyle: { height: headerHeight, backgroundColor: mainHeaderColor },
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
