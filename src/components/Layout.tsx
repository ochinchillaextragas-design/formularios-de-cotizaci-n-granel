import type { PropsWithChildren } from 'react'
export function Layout({ children }: PropsWithChildren) { return <><div className="brand-stripe" /><main className="page">{children}</main></> }
