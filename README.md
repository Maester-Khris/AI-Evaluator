#### Project architecture
src/
├── assets/
├── common/           # Shared UI (Buttons, Inputs, Modals)
├── features/         # Logic-heavy domains
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/    # Custom logic (useAuth.ts)
│   │   └── services/ # API calls
├── chat/
│   │   ├── components/       # MessageList, ChatInput, SidebarLink
│   │   ├── hooks/            # useChatLogic.ts (State & API)
│   │   └── types.ts          # Interface Message { role: 'user' |'ai' }
├── layouts/
│   └── MainLayout.tsx        # Defines the 2-layer grid
├── hooks/            # Global hooks (useLocalStorage, etc.)
└── App.tsx

### snippet shortcut
-- rafce
-- ueh
-- usf 
-- imp + Tab: Generates import moduleName from 'module'.
-- imd + Tab: Generates a destructured import: import { name } from 'module'