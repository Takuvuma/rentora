import Link from 'next/link'

export function RentoraLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 32
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'

  return (
    <Link href="/" className={`flex items-center gap-2 font-serif ${textSize} text-[#0A1628]`}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="512" height="512" rx="112" fill="#0A1628"/>
        <path d="M144 220L256 108L368 220Z" fill="#0D9E75"/>
        <path d="M168 220L168 404Q168 416 180 416L220 416Q232 416 232 404L232 320L268 320L320 416Q326 416 332 416L372 416Q384 416 380 404L328 312Q368 296 368 252Q368 216 328 210L180 210Q168 210 168 220Z" fill="#0D9E75"/>
        <path d="M232 250L232 296L300 296Q328 296 328 274Q328 250 300 250Z" fill="#0A1628"/>
        <circle cx="400" cy="124" r="14" fill="#1BC99A"/>
      </svg>
      Rentora
    </Link>
  )
}
