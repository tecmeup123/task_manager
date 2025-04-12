import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type OnboardingStep = 
  | "welcome" 
  | "dashboard" 
  | "tasks" 
  | "editions" 
  | "settings" 
  | "complete";

interface OnboardingContextType {
  isOnboarding: boolean;
  currentStep: OnboardingStep;
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_SEEN_KEY = 'training-app-onboarding-seen';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");

  // Check if the user has already completed onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_SEEN_KEY) === 'true';
    if (!hasSeenOnboarding) {
      // Automatically show onboarding for new users
      setIsOnboarding(true);
    }
  }, []);

  const startOnboarding = () => {
    setIsOnboarding(true);
    setCurrentStep("welcome");
  };

  const nextStep = () => {
    switch (currentStep) {
      case "welcome":
        setCurrentStep("dashboard");
        break;
      case "dashboard":
        setCurrentStep("tasks");
        break;
      case "tasks":
        setCurrentStep("editions");
        break;
      case "editions":
        setCurrentStep("settings");
        break;
      case "settings":
        setCurrentStep("complete");
        break;
      case "complete":
        completeOnboarding();
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case "dashboard":
        setCurrentStep("welcome");
        break;
      case "tasks":
        setCurrentStep("dashboard");
        break;
      case "editions":
        setCurrentStep("tasks");
        break;
      case "settings":
        setCurrentStep("editions");
        break;
      case "complete":
        setCurrentStep("settings");
        break;
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setIsOnboarding(false);
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStep,
        startOnboarding,
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}