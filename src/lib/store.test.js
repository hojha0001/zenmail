import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../lib/store.js';

// Reset store state between tests
beforeEach(() => {
  useStore.setState({
    accounts: [],
    activeAccountIds: [],
    threads: [],
    selectedThreadId: null,
    labels: [
      { id: 'inbox', name: 'Inbox', color: null },
      { id: 'sent', name: 'Sent', color: null },
    ],
    composeOpen: false,
    composeReplyTo: null,
    searchQuery: '',
    searchResults: [],
    sidebarOpen: false,
    activeLabel: 'inbox',
    isSyncing: false,
    lastSynced: null,
  });
});

describe('Store — accounts', () => {
  it('adds an account', () => {
    useStore.getState().addAccount({ id: 'a1', provider: 'gmail', email: 'test@gmail.com' });
    expect(useStore.getState().accounts).toHaveLength(1);
    expect(useStore.getState().activeAccountIds).toContain('a1');
  });

  it('removes an account', () => {
    useStore.getState().addAccount({ id: 'a1', provider: 'gmail', email: 'test@gmail.com' });
    useStore.getState().removeAccount('a1');
    expect(useStore.getState().accounts).toHaveLength(0);
    expect(useStore.getState().activeAccountIds).not.toContain('a1');
  });
});

describe('Store — threads', () => {
  const mockThreads = [
    { id: 't1', subject: 'Hello', labels: ['inbox'], unread: true, priorityScore: 0.8 },
    { id: 't2', subject: 'Newsletter', labels: ['inbox'], unread: false, priorityScore: 0.2 },
  ];

  it('sets threads', () => {
    useStore.getState().setThreads(mockThreads);
    expect(useStore.getState().threads).toHaveLength(2);
  });

  it('marks thread as read', () => {
    useStore.getState().setThreads(mockThreads);
    useStore.getState().markRead('t1');
    const thread = useStore.getState().threads.find((t) => t.id === 't1');
    expect(thread.unread).toBe(false);
  });

  it('archives thread and clears selection', () => {
    useStore.getState().setThreads(mockThreads);
    useStore.getState().selectThread('t1');
    useStore.getState().archiveThread('t1');
    expect(useStore.getState().threads.find((t) => t.id === 't1')).toBeUndefined();
    expect(useStore.getState().selectedThreadId).toBeNull();
  });

  it('deletes thread', () => {
    useStore.getState().setThreads(mockThreads);
    useStore.getState().deleteThread('t2');
    expect(useStore.getState().threads).toHaveLength(1);
  });
});

describe('Store — getVisibleThreads', () => {
  it('returns inbox threads by default', () => {
    useStore.getState().setThreads([
      { id: 't1', labels: ['inbox'], unread: true },
      { id: 't2', labels: ['sent'], unread: false },
    ]);
    const visible = useStore.getState().getVisibleThreads();
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('t1');
  });

  it('returns search results when query is set', () => {
    useStore.getState().setThreads([{ id: 't1', labels: ['inbox'] }]);
    useStore.getState().setSearchResults([{ id: 'sr1', subject: 'search result' }]);
    useStore.getState().setSearchQuery('test query');
    const visible = useStore.getState().getVisibleThreads();
    expect(visible[0].id).toBe('sr1');
  });
});

describe('Store — compose', () => {
  it('opens and closes compose modal', () => {
    useStore.getState().openCompose({ id: 't1' });
    expect(useStore.getState().composeOpen).toBe(true);
    expect(useStore.getState().composeReplyTo.id).toBe('t1');

    useStore.getState().closeCompose();
    expect(useStore.getState().composeOpen).toBe(false);
    expect(useStore.getState().composeReplyTo).toBeNull();
  });
});
