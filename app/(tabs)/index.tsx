import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Introduction from '@/components/Introduction';
import Listening from '@/components/Listening';
import Test from '@/components/Test';
import TranscriptReview from '@/components/TranscriptReview';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Introduction" headerMode="none">
        <Stack.Screen name="Introduction" component={Introduction} />
        <Stack.Screen name="Listening" component={Listening} />
        <Stack.Screen name="Test" component={Test} />
        <Stack.Screen name="TranscriptReview" component={TranscriptReview} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
