import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import PerfilScreen from '../screens/shared/PerfilScreen';
import { ReponedorTasksScreen, ReponedorDashboardScreen, ReponedorRutaScreen, ReponedorMapScreen } from '../screens/reponedor';
import { SupervisorDashboardScreen, SupervisorMapScreen, SupervisorTasksScreen } from '../screens/supervisor';

// Tipos para la navegación
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type SupervisorTabParamList = {
  Dashboard: undefined;
  Tareas: undefined;
  Mapa: undefined;
  Perfil: undefined;
};

export type ReponedorTabParamList = {
  Dashboard: undefined;
  Tareas: undefined;
  Mapa: undefined;
  Ruta: undefined;
  Perfil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const SupervisorTab = createBottomTabNavigator<SupervisorTabParamList>();
const ReponedorTab = createBottomTabNavigator<ReponedorTabParamList>();

// Placeholder screens temporales
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
      {title}
    </Text>
    <Text style={{ fontSize: 14, color: '#666' }}>
      Próximamente
    </Text>
  </View>
);

// Tabs para Supervisor
function SupervisorTabs() {
  return (
    <SupervisorTab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999999',
      }}
    >
      <SupervisorTab.Screen
        name="Dashboard"
        component={SupervisorDashboardScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <SupervisorTab.Screen
        name="Tareas"
        component={SupervisorTasksScreen}
        options={{
          title: 'Tareas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <SupervisorTab.Screen
        name="Mapa"
        component={SupervisorMapScreen}
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <SupervisorTab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </SupervisorTab.Navigator>
  );
}

// Tabs para Reponedor
function ReponedorTabs() {
  return (
    <ReponedorTab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999999',
      }}
    >
      <ReponedorTab.Screen
        name="Dashboard"
        component={ReponedorDashboardScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <ReponedorTab.Screen
        name="Tareas"
        component={ReponedorTasksScreen}
        options={{
          title: 'Tareas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <ReponedorTab.Screen
        name="Mapa"
        component={ReponedorMapScreen}
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <ReponedorTab.Screen
        name="Ruta"
        component={ReponedorRutaScreen}
        options={{
          title: 'Ruta',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="navigate" size={size} color={color} />
          ),
        }}
      />
      <ReponedorTab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </ReponedorTab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (typeof user.rol === 'string' ? user.rol.toLowerCase() : user.rol) === 'supervisor' || user.rol === 2 ? (
          <Stack.Screen name="Main" component={SupervisorTabs} />
        ) : (
          <Stack.Screen name="Main" component={ReponedorTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
