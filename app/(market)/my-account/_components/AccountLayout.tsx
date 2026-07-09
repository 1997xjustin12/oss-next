import { AccountSidebar } from './AccountSidebar'

type Props = {
  children: React.ReactNode
}

export function AccountLayout({ children }: Props) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <AccountSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
