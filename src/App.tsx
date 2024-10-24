import Game from './components/game'
import Header from './components/header'
import Lobby from './components/lobby'
import useSearchParams from './hooks/search-param'
import { useState } from 'react'

function App() {
  const [mode, setMode] = useSearchParams('mode', '')
  const [started, setStarted] = useState(false)

  return (
    <main className="min-h-dvh flex justify-center pt-4 bg-[#F5F5F5] pb-12">
      <div className="flex flex-col w-full px-4 md:w-1/2 md:px-0 xl:w-1/4 gap-3">
        <Header />
        {!started && (
          <Lobby mode={mode} setMode={setMode} setStarted={setStarted} />
        )}
        {started && <Game mode={mode} />}
      </div>
    </main>
  )
}

export default App
