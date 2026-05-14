import type { ReactNode } from 'react';

type PageTransitionProps = {
  children: ReactNode;
  name?: string;
};

export function PageTransition({ children, name = 'page' }: PageTransitionProps) {
  return (
    <div key={name} className="page-transition" data-screen={name}>
      {children}
    </div>
  );
}
