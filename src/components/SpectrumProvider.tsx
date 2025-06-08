'use client';

import { Provider, defaultTheme } from '@adobe/react-spectrum';
import { ReactNode, useEffect, useState } from 'react';

export default function SpectrumProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      {children}
    </Provider>
  );
}
