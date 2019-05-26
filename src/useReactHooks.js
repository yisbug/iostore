import { useState, useEffect } from 'react';
import { subScribe, unSubScribe } from './pub';

export default name => {
  const [, setState] = useState();
  useEffect(() => {
    subScribe(name, setState);
    return () => unSubScribe(name, setState);
  }, []);
};
