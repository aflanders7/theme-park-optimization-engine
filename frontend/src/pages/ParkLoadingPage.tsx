// frontend/src/pages/ParkLoadingPage.tsx
import LoadingScreen from '../components/LoadingScreen';

export default function ParkLoadingPage() {
  return <LoadingScreen 
    messages={[
      'Analyzing crowd levels...',
      'Finding the best park days...',
      'Optimizing your schedule...',
      'Matching to your preferences...',
      'Creating your perfect plan...'
    ]}
  />;
}