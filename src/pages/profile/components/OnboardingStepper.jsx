import CustomStepper from '../../../components/common/CustomStepper';

const STEPS = [
  { label: 'Profile' },
  { label: 'Experience' },
  { label: 'Education' },
  { label: 'Skills' },
  { label: 'Projects' },
  { label: 'Preferences' },
  { label: 'Links' },
];

export default function OnboardingStepper({ activeStep }) {
  return <CustomStepper steps={STEPS} activeStep={activeStep} variant="compact" />;
}
