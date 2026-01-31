import { useState } from 'react'
import MainLayout from './layouts/MainLayout'
import {ChatContainer} from './features/chat/components/ChatContainer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <MainLayout>
      <ChatContainer/>
    </MainLayout>
  )
}

export default App
