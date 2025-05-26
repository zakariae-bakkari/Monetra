"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@src/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@src/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { TutorialStep } from "@src/context/tutorialContext";

interface TutorialTooltipProps {
  step: TutorialStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function TutorialTooltip({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onClose,
}: TutorialTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState("bottom");
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const positionTooltip = () => {
      try {
        const targetElement = document.querySelector(step.target);
        
        if (!targetElement || !tooltipRef.current) {
          return;
        }

        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculate positions based on step.position
        let top = 0;
        let left = 0;
        let arrow = step.position;

        switch (step.position) {
          case "top":
            top = targetRect.top - tooltipRect.height - 10;
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            arrow = "bottom";
            break;
          case "bottom":
            top = targetRect.bottom + 10;
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            arrow = "top";
            break;
          case "left":
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            left = targetRect.left - tooltipRect.width - 10;
            arrow = "right";
            break;
          case "right":
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            left = targetRect.right + 10;
            arrow = "left";
            break;
        }

        // Ensure tooltip stays within viewport
        if (top < 0) top = 0;
        if (left < 0) left = 0;
        if (top + tooltipRect.height > viewportHeight) {
          top = viewportHeight - tooltipRect.height - 10;
        }
        if (left + tooltipRect.width > viewportWidth) {
          left = viewportWidth - tooltipRect.width - 10;
        }

        setPosition({ top: top + window.scrollY, left });
        setArrowPosition(arrow);
        
        // Highlight the target element
        targetElement.classList.add('tutorial-highlight');
      } catch (err) {
        console.error("Error positioning tutorial tooltip:", err);
      }
    };

    positionTooltip();
    
    // Add scroll and resize event listeners
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip);

    // Remove highlight from previous elements
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      if (!el.matches(step.target)) {
        el.classList.remove('tutorial-highlight');
      }
    });

    return () => {
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip);
      // Clean up highlight classes
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [step]);

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`fixed z-50 shadow-xl`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <Card className="w-[320px] border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="flex items-center text-xs text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onPrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> 
                  Back
                </Button>
              )}
              <Button 
                size="sm"
                onClick={onNext}
              >
                {currentStep < totalSteps - 1 ? (
                  <>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>
          </CardFooter>
          
          {/* Arrow pointing to the target element */}
          <div 
            className={`absolute w-3 h-3 bg-background border-primary/20 rotate-45 
              ${arrowPosition === "top" ? "top-[-6px] border-t border-l" : ""}
              ${arrowPosition === "bottom" ? "bottom-[-6px] border-b border-r" : ""}
              ${arrowPosition === "left" ? "left-[-6px] border-l border-t" : ""}
              ${arrowPosition === "right" ? "right-[-6px] border-r border-b" : ""}
            `}
            style={{
              left: arrowPosition === "top" || arrowPosition === "bottom" ? "50%" : "",
              marginLeft: arrowPosition === "top" || arrowPosition === "bottom" ? "-6px" : "",
              top: arrowPosition === "left" || arrowPosition === "right" ? "50%" : "",
              marginTop: arrowPosition === "left" || arrowPosition === "right" ? "-6px" : "",
            }}
          />
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}