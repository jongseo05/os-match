import type { FC } from "react"

interface OSMatchLogoProps {
  className?: string
}

const OSMatchLogo: FC<OSMatchLogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-emerald-500 font-bold text-xl">OS-Match</span>
    </div>
  )
}

export default OSMatchLogo
