interface TeamLogoProps {
  team: string
  className?: string
}

/** Logos locales: no requieren conexión durante la demo. */
export function TeamLogo({ team, className = 'h-10 w-10' }: TeamLogoProps) {
  if (!/^[A-Z]{2,3}$/.test(team)) return null
  return <img src={`${import.meta.env.BASE_URL}teams/${team}.png`} alt={`Logo de ${team}`} className={`${className} shrink-0 object-contain`} loading="lazy" />
}
