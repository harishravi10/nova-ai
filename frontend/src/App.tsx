import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { Sidebar } from './components/layout/Sidebar';
import { ChatHeader } from './components/layout/ChatHeader';
import { MessageList } from './components/chat/MessageList';
import { MessageInput } from './components/chat/MessageInput';
import { SettingsModal } from './components/modals/SettingsModal';
import { ShareModal } from './components/modals/ShareModal';
import { RenameModal } from './components/modals/RenameModal';
import { DeleteModal } from './components/modals/DeleteModal';
import { AuthModal } from './components/modals/AuthModal';
import { HelpModal } from './components/modals/HelpModal';
import type { Conversation } from './types';

const ChatApp: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<Conversation | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0e14] text-slate-100 font-sans">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenRename={(conv) => setConversationToRename(conv)}
        onOpenDelete={(conv) => setConversationToDelete(conv)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-[#0b0d13]">
        <ChatHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenShareModal={() => setIsShareOpen(true)}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
        />

        <MessageList />
        <MessageInput />
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <RenameModal
        conversation={conversationToRename}
        isOpen={Boolean(conversationToRename)}
        onClose={() => setConversationToRename(null)}
      />

      <DeleteModal
        conversation={conversationToDelete}
        isOpen={Boolean(conversationToDelete)}
        onClose={() => setConversationToDelete(null)}
      />

      <AuthModal />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <ChatApp />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
