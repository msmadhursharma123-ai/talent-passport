interface WizardLayoutProps {
  title: string;
  subtitle: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
}