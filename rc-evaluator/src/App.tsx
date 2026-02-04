import MainLayout from './layouts/MainLayout'
import {ChatContainer} from './features/chat/components/ChatContainer'
import { AuthProvider } from '@/features/auth/auth.context';

function App() {
  return (
    <AuthProvider>
      <ChatContainer />
    </AuthProvider>
  )
}

export default App

// <MainLayout>
//   <ChatContainer/>
// </MainLayout>