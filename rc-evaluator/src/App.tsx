import { AuthUIProvider } from './features/auth/context/authui.context';
import { ChatContainer } from './features/chat/components/ChatContainer'
import { AuthProvider } from '@/features/auth/context/auth.context';

function App() {
  return (
    <AuthProvider>
      <AuthUIProvider>    
        <ChatContainer />
      </AuthUIProvider>
    </AuthProvider>
  )
}

export default App
