import { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
};

export default function Section({ title, children }: Props) {
  return (
    <section className="w-full">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">{title}</h2>
      {children}
    </section>
  );
}
