import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StepCard from '../components/StepCard';
import DetailedStepsCard from '../components/DetailedStepsCard';
import NavigationButtons from '../components/NavigationButtons';
import ChatWithAI from '../components/ChatWithAI';

const CookingScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: 'Step 1',
      description: 'Marinate the Chicken with spices',
      time: '30 sec',
      ingredients: [
        { name: 'Chicken Breast', quantity: '200g' },
        { name: 'Salt', quantity: '1 tsp' },
        { name: 'Pepper', quantity: '2 tsp' },
        { name: 'Chilli', quantity: '1/2 tsp' },
      ],
      detailedSteps: [
        '1.a. Wash the chicken',
        '1.b. Make a paste with the help of spices',
        '1.c. Mix the chicken well with the paste made',
      ],
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Cooking Steps for the Recipe</Text>
      <StepCard
        title={steps[currentStep - 1].title}
        description={steps[currentStep - 1].description}
        time={steps[currentStep - 1].time}
        ingredients={steps[currentStep - 1].ingredients}
      />
      <DetailedStepsCard steps={steps[currentStep - 1].detailedSteps} />
      <NavigationButtons onNext={handleNext} onPrevious={handlePrevious} />
      <ChatWithAI />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default CookingScreen;
