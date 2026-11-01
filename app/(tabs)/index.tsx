import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Introduction from '@/components/Introduction';
import Listening from '@/components/Listening';
import Test from '@/components/Test';
import TranscriptReview from '@/components/TranscriptReview';
import { SessionProvider } from '@/hooks/useSession';

const Stack = createStackNavigator();

const App = () => {
  return (
    <SessionProvider>
    <NavigationIndependentTree><NavigationContainer>
      <Stack.Navigator initialRouteName="Introduction" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Introduction" component={Introduction} />
        <Stack.Screen name="Listening" component={Listening} />
        <Stack.Screen name="Test" component={Test} />
        <Stack.Screen name="TranscriptReview" component={TranscriptReview} />
      </Stack.Navigator>
    </NavigationContainer></NavigationIndependentTree>
    </SessionProvider>
  );
};

export default App;
