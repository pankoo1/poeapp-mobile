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
import { 
  ReponedorTasksScreen, 
  ReponedorDashboardScreen, 
  ReponedorRutaScreen,
  RutaVisualizacionScreen 
} from '../screens/reponedor';
import { 
  SupervisorDashboardScreen, 
  SupervisorMapScreen, 
  SupervisorTasksScreen, 
  SupervisorReponedoresScreen,
  SupervisorCreateTaskScreen 
} from '../screens/supervisor';

// Tipos para la navegación
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type SupervisorTabParamList = {
  Dashboard: undefined;
  Tareas: undefined;
  Mapa: undefined;
  Reponedores: undefined;
  Perfil: undefined;
};

export type SupervisorStackParamList = {
  SupervisorTabs: undefined;
  CreateTask: {
    selectedPoints: Array<{
      punto: any;
      cantidad: number;
    }>;
  };
};

export type ReponedorTabParamList = {
  Dashboard: undefined;
  Tareas: undefined;
  Ruta: undefined;
  Perfil: undefined;
};

export type ReponedorStackParamList = {
  ReponedorTabs: undefined;
  RutaVisualizacion: { idTarea: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const SupervisorTab = createBottomTabNavigator<SupervisorTabParamList>();
const SupervisorStack = createNativeStackNavigator<SupervisorStackParamList>();
const ReponedorTab = createBottomTabNavigator<ReponedorTabParamList>();
const ReponedorStack = createNativeStackNavigator<ReponedorStackParamList>();

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
        name="Reponedores"
        component={SupervisorReponedoresScreen}
        options={{
          title: 'Reponedores',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
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

// Stack Navigator para Supervisor (incluye pantallas modales)
function SupervisorStackNavigator() {
  return (
    <SupervisorStack.Navigator>
      <SupervisorStack.Screen
        name="SupervisorTabs"
        component={SupervisorTabs}
        options={{ headerShown: false }}
      />
      <SupervisorStack.Screen
        name="CreateTask"
        component={SupervisorCreateTaskScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </SupervisorStack.Navigator>
  );
}

// Stack Navigator para Reponedor (incluye pantallas modales)
function ReponedorStackNavigator() {
  return (
    <ReponedorStack.Navigator>
      <ReponedorStack.Screen
        name="ReponedorTabs"
        component={ReponedorTabs}
        options={{ headerShown: false }}
      />
      <ReponedorStack.Screen
        name="RutaVisualizacion"
        component={RutaVisualizacionScreen}
        options={{
          title: 'Ruta Optimizada',
          headerBackTitle: 'Atrás',
        }}
      />
    </ReponedorStack.Navigator>
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
          <Stack.Screen name="Main" component={SupervisorStackNavigator} />
        ) : (
          <Stack.Screen name="Main" component={ReponedorStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
