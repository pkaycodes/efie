import { useEffect } from 'react'

const BASE_TITLE = 'Efie — Find a place that feels like home'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Efie` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [title])
}
