import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      App works {{count}}
    </>
  )
}

export default App
