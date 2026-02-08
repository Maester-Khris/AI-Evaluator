import { AuthUIProvider } from './features/auth/context/authui.context';
import { ChatContainer } from './features/chat/components/ChatContainer'
import { AuthProvider } from '@/features/auth/context/auth.context';

function App() {

  // Mock guest session
  const GUEST_SESSION = {
    token: "mock-guest-token-123",
    user: { id: "guest-id", name: "Guest User", email: "guest@example.com" }
  };

  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', GUEST_SESSION.token);
    localStorage.setItem('user', JSON.stringify(GUEST_SESSION.user));
  }


  return (
    <AuthProvider>
      <AuthUIProvider>
        <ChatContainer />
      </AuthUIProvider>
    </AuthProvider>
  )
}

export default App
