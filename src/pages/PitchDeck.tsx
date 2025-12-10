import { useEffect } from 'react';

const PitchDeck = () => {
  useEffect(() => {
    // Redirect to the PDF file
    window.location.href = '/Simantic_PitchDeck_V3.pdf';
  }, []);

  return null;
};

export default PitchDeck;
