import { useState, useEffect, useCallback } from 'react'

function useSearchParams<T>(queryKey: string, initialState: T) {
  // Helper function to get the current search param value
  const getSearchParam = useCallback((): T => {
    const params = new URLSearchParams(window.location.search)
    const paramValue = params.get(queryKey)
    return paramValue !== null ? (paramValue as unknown as T) : initialState
  }, [queryKey, initialState])

  // State to hold the value of the query param
  const [value, setValue] = useState<T>(getSearchParam)

  // Function to update the search param in the URL
  const setSearchParam = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(window.location.search)

      if (newValue !== initialState) {
        params.set(queryKey, String(newValue))
      } else {
        params.delete(queryKey) // Remove param if it's back to initial state
      }

      // Update the URL without reloading the page
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState(null, '', newUrl)

      // Update the state
      setValue(newValue)
    },
    [queryKey, initialState]
  )

  // Listen for popstate events to synchronize with back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setValue(getSearchParam())
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [getSearchParam])

  return [value, setSearchParam] as const
}

export default useSearchParams
