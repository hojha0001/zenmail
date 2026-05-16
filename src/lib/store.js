import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // --- Accounts ---
  accounts: [],
  activeAccountIds: [],

  addAccount: (account) =>
    set((s) => ({
      accounts: [...s.accounts, account],
      activeAccountIds: [...s.activeAccountIds, account.id],
    })),

  removeAccount: (id) =>
    set((s) => ({
      accounts: s.accounts.filter((a) => a.id !== id),
      activeAccountIds: s.activeAccountIds.filter((aid) => aid !== id),
    })),

  // --- Threads ---
  threads: [],
  selectedThreadId: null,

  setThreads: (threads) => set({ threads }),

  updateThread: (id, patch) =>
    set((s) => ({
      threads: s.threads.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  selectThread: (id) => set({ selectedThreadId: id }),

  markRead: (id) => {
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === id ? { ...t, unread: false } : t
      ),
    }));
  },

  archiveThread: (id) =>
    set((s) => ({
      threads: s.threads.filter((t) => t.id !== id),
      selectedThreadId: s.selectedThreadId === id ? null : s.selectedThreadId,
    })),

  deleteThread: (id) =>
    set((s) => ({
      threads: s.threads.filter((t) => t.id !== id),
      selectedThreadId: s.selectedThreadId === id ? null : s.selectedThreadId,
    })),

  // --- Labels ---
  labels: [
    { id: 'inbox', name: 'Inbox', color: null },
    { id: 'sent', name: 'Sent', color: null },
    { id: 'drafts', name: 'Drafts', color: null },
    { id: 'starred', name: 'Starred', color: '#fbbf24' },
    { id: 'important', name: 'Important', color: '#6ee7b7' },
  ],

  // --- UI State ---
  composeOpen: false,
  composeReplyTo: null,
  searchQuery: '',
  searchResults: [],
  sidebarOpen: false,
  activeLabel: 'inbox',
  isSyncing: false,
  lastSynced: null,

  openCompose: (replyTo = null) => set({ composeOpen: true, composeReplyTo: replyTo }),
  closeCompose: () => set({ composeOpen: false, composeReplyTo: null }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveLabel: (label) => set({ activeLabel: label }),
  setSyncing: (v) => set({ isSyncing: v }),
  setLastSynced: (t) => set({ lastSynced: t }),

  // --- Derived ---
  getVisibleThreads: () => {
    const { threads, activeLabel, searchQuery, searchResults } = get();
    if (searchQuery && searchResults.length) return searchResults;
    return threads.filter((t) => t.labels?.includes(activeLabel));
  },
}));
