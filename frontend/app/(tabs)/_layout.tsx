import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D32F2F',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { height: 60, paddingBottom: 8 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Documente',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📄</Text>,
        }}
      />
      <Tabs.Screen
      name="map"
      options={{
        title: 'Hartă',
        tabBarIcon: ({ color }) => <Text style={{ color }}>🗺️</Text>,
        }}
/>
    </Tabs>
  );
}