// React's types do not know the Invoker Commands attributes yet.
// React 19 passes them through as lowercase attributes.
import 'react';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ButtonHTMLAttributes<T> {
    command?: 'show-modal' | 'close' | 'request-close' | `--${string}`;
    commandfor?: string;
  }
}
