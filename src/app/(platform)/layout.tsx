import type { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -right-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl animate-pulse [animation-delay:400ms]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl animate-pulse [animation-delay:800ms]" />
        <div className="absolute -bottom-10 right-1/4 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl animate-pulse [animation-delay:1200ms]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Layout;
