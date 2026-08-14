import type { PropsWithChildren } from 'react'
export function Section({ title, children, className = '' }: PropsWithChildren<{ title: string; className?: string }>) {
  return <section className={`section ${className}`}><h2>{title}</h2><div className="section-body">{children}</div></section>
}
