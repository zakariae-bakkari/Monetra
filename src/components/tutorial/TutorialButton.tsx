"use client";

import React from "react";
import { Button } from "@src/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useTutorial } from "@src/context/tutorialContext";

interface TutorialButtonProps {
  tutorialId: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function TutorialButton({
  tutorialId,
  className = "",
  variant = "outline",
  size = "sm",
  children,
}: TutorialButtonProps) {
  const { startTutorial } = useTutorial();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => startTutorial(tutorialId)}
    >
      {children || (
        <>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help
        </>
      )}
    </Button>
  );
}