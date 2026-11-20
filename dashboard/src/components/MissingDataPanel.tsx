import { NoticeList } from './NoticeList'

/** Panel fijo: recuerda siempre qué información no existe en los datos. */
export function MissingDataPanel({ limits }: { limits: string[] }) {
  return (
    <NoticeList
      title="Datos que faltan"
      subtitle="Por esto nada aquí es una recomendación de trade."
      items={limits}
      tone="warn"
    />
  )
}
