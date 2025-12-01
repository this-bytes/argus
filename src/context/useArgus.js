import { useContext } from 'react';
import ArgusContext from './ArgusContext';

export function useArgus() {
  const context = useContext(ArgusContext);
  if (!context) {
    throw new Error('useArgus must be used within an ArgusProvider');
  }
  return context;
}
