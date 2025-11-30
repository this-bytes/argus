import { useContext } from 'react';
import VectorContext from './VectorContext';

export function useVector() {
  const context = useContext(VectorContext);
  if (!context) {
    throw new Error('useVector must be used within a VectorProvider');
  }
  return context;
}
