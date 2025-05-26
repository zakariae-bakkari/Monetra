"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
  order: number;
}

interface TutorialContextType {
  isTutorialActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  completedTutorials: string[];
  startTutorial: (tutorialId: string) => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setSteps: (steps: TutorialStep[]) => void;
  markTutorialComplete: (tutorialId: string) => void;
  markTutorialIncomplete: (tutorialId: string) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  // Load completed tutorials from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTutorials = localStorage.getItem('monetra_completed_tutorials');
      if (savedTutorials) {
        setCompletedTutorials(JSON.parse(savedTutorials));
      }
    }
  }, []);

  // Start the tutorial
  const startTutorial = (tutorialId: string) => {
    // Reset to the first step
    setCurrentStep(0);
    
    // Set tutorial as active
    setIsTutorialActive(true);
    
    console.log(`Starting tutorial with ID: ${tutorialId}`);
    
    // You could also use the tutorialId to load specific steps
    // for different tutorials from tutorialSteps.ts
    // Example:
    // const tutorialSteps = getTutorialStepsById(tutorialId);
    // setTutorialSteps(tutorialSteps);
  };

  // End the tutorial
  const endTutorial = () => {
    setIsTutorialActive(false);
  };

  // Go to next step in the tutorial
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTutorial();
    }
  };

  // Go to previous step in the tutorial
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Set the steps for a tutorial
  const setTutorialSteps = (newSteps: TutorialStep[]) => {
    // Sort steps by their order property
    const sortedSteps = [...newSteps].sort((a, b) => a.order - b.order);
    setSteps(sortedSteps);
  };

  // Mark a tutorial as completed
  const markTutorialComplete = (tutorialId: string) => {
    const updatedCompletedTutorials = [...completedTutorials];
    if (!updatedCompletedTutorials.includes(tutorialId)) {
      updatedCompletedTutorials.push(tutorialId);
      setCompletedTutorials(updatedCompletedTutorials);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('monetra_completed_tutorials', JSON.stringify(updatedCompletedTutorials));
      }
    }
  };

  // Mark a tutorial as incomplete (for testing/reset purposes)
  const markTutorialIncomplete = (tutorialId: string) => {
    const updatedCompletedTutorials = completedTutorials.filter(id => id !== tutorialId);
    setCompletedTutorials(updatedCompletedTutorials);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('monetra_completed_tutorials', JSON.stringify(updatedCompletedTutorials));
    }
  };

  const contextValue: TutorialContextType = {
    isTutorialActive,
    currentStep,
    steps,
    completedTutorials,
    startTutorial,
    endTutorial,
    nextStep,
    prevStep,
    setSteps: setTutorialSteps,
    markTutorialComplete,
    markTutorialIncomplete,
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};