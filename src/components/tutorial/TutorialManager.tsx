"use client";

import React, { useEffect } from "react";
import { useTutorial } from "@src/context/tutorialContext";
import { TutorialTooltip } from "./TutorialTooltip";
import { usePathname } from "next/navigation";

interface TutorialManagerProps {
  children?: React.ReactNode;
}

export function TutorialManager({ children }: TutorialManagerProps) {
  const { 
    isTutorialActive, 
    endTutorial,
    steps,
    currentStep,
    nextStep,
    prevStep
  } = useTutorial();
  const pathname = usePathname();

  // End tutorial when navigating to a different page
  useEffect(() => {
    endTutorial();
  }, [pathname, endTutorial]);

  return (
    <>
      {children}
      {isTutorialActive && steps.length > 0 && (
        <TutorialTooltip
          step={steps[currentStep]}
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onClose={endTutorial}
        />
      )}
    </>
  );
}