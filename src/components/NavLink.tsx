import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface NavLinkProps {
  href: string
  icon: LucideIcon
  label: string
  mobile?: boolean
}

export default function NavLink({ href, icon: Icon, label, mobile = false }: NavLinkProps) {
  const baseClasses = "group flex items-center text-gray-300 transition-all duration-300 ease-in-out"
  const desktopClasses = "px-3 py-2 rounded-md text-sm font-medium"
  const mobileClasses = "px-3 py-2 rounded-md text-base font-medium"

  const iconClasses = mobile
    ? "w-5 h-5 mr-3 group-hover:text-emerald-400 transition-colors duration-300"
    : "w-4 h-4 mr-2 group-hover:text-emerald-400 transition-colors duration-300"

  return (
    <Link href={href} className={`${baseClasses} ${mobile ? mobileClasses : desktopClasses}`}>
      <Icon className={iconClasses} />
      <span className="relative overflow-hidden">
        {label}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300 ease-in-out"></span>
      </span>
    </Link>
  )
}
