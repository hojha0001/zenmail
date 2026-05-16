import React from 'react';
import { useStore } from '../lib/store.js';
import Sidebar from '../components/sidebar/Sidebar.jsx';
import ThreadList from '../components/inbox/ThreadList.jsx';
import ThreadDetail from '../components/inbox/ThreadDetail.jsx';
import TopBar from '../components/common/TopBar.jsx';

export default function InboxPage() {
  const { selectedThreadId, sidebarOpen } = useStore();

  return (
    <div className="flex h-full bg-surface-0 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-20 w-64 transition-transform duration-200
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar />
      </div>

      {/* Sidebar backdrop on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/60 md:hidden"
          onClick={() => useStore.getState().toggleSidebar()}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar />

        <div className="flex flex-1 min-h-0">
          {/* Thread list */}
          <div
            className={`
              flex-shrink-0 border-r border-surface-2 overflow-y-auto
              ${selectedThreadId ? 'hidden md:block w-80 lg:w-96' : 'w-full'}
            `}
          >
            <ThreadList />
          </div>

          {/* Thread detail */}
          {selectedThreadId && (
            <div className="flex-1 min-w-0 overflow-y-auto">
              <ThreadDetail threadId={selectedThreadId} />
            </div>
          )}

          {/* Empty state on desktop */}
          {!selectedThreadId && (
            <div className="hidden md:flex flex-1 items-center justify-center text-text-muted">
              <div className="text-center">
                <div className="text-4xl mb-3">✉</div>
                <p className="text-sm">Select a thread to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
