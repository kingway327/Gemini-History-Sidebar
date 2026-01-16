import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatSession } from './types/chat';



function App() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore] = useState(true);
    const [user, setUser] = useState({ name: 'Gemini User', plan: 'Gemini Free' });

    // 处理选择子项（页面内导航）
    const handleSelectSubItem = useCallback((index: number) => {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab && typeof activeTab.id === 'number') {
                    chrome.tabs.sendMessage(activeTab.id, { action: 'SCROLL_TO_MESSAGE', index });
                }
            });
        }
    }, []);

    // 加载真实数据
    useEffect(() => {
        const fetchRealData = () => {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const activeTab = tabs[0];
                    if (activeTab && typeof activeTab.id === 'number' && activeTab.url?.includes('gemini.google.com')) {
                        const tabId = activeTab.id;
                        // 1. 先抓取会话列表和用户信息
                        chrome.tabs.sendMessage(tabId, { action: 'GET_GEMINI_HISTORY' }, (response) => {
                            if (chrome.runtime.lastError) {
                                setSessions([]);
                                setIsLoading(false);
                                return;
                            }

                            if (response && response.success && response.data) {
                                const { sessions: fetchedSessions, userInfo } = response.data;
                                if (fetchedSessions && fetchedSessions.length > 0) {
                                    setSessions(fetchedSessions);
                                    setActiveId(fetchedSessions[0].id);
                                }
                                if (userInfo) {
                                    setUser({
                                        name: userInfo.name || 'Gemini User',
                                        plan: userInfo.plan === 'Gemini Advanced' ? 'Gemini Advanced' : 'Gemini Free'
                                    });
                                }

                                // 2. 接着抓取当前对话的内部子项
                                chrome.tabs.sendMessage(tabId, { action: 'GET_CONVERSATION_SUBITEMS' }, (subResponse) => {
                                    if (subResponse && subResponse.success) {
                                        setSessions(prev => prev.map(s =>
                                            (fetchedSessions && fetchedSessions.length > 0 && s.id === fetchedSessions[0].id) ? { ...s, subItems: subResponse.data } : s
                                        ));
                                    }
                                    setIsLoading(false);
                                });
                            } else {
                                setSessions([]);
                                setIsLoading(false);
                            }
                        });
                    } else {
                        setSessions([]);
                        setIsLoading(false);
                    }
                });
            } else {
                setSessions([]);
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchRealData, 800);
        return () => clearTimeout(timer);
    }, []);

    // 处理新建对话
    const handleNewChat = useCallback(() => {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            const url = 'https://gemini.google.com/app';
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab && activeTab.id) {
                    chrome.tabs.update(activeTab.id, { url });
                } else {
                    chrome.tabs.create({ url });
                }
            });
        }
    }, []);

    // 处理选择对话
    const handleSelectSession = useCallback((id: string) => {
        setActiveId(id);
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            const url = id.startsWith('http') ? id : `https://gemini.google.com/app/${id}`;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab && activeTab.id) {
                    if (activeTab.url?.includes('gemini.google.com')) {
                        chrome.tabs.update(activeTab.id, { url, active: true });
                    } else {
                        chrome.tabs.create({ url, active: true });
                    }
                    window.close();
                }
            });
        }
    }, []);

    return (
        <div className="h-full w-full">
            <Sidebar
                sessions={sessions}
                activeId={activeId}
                onSelectSession={handleSelectSession}
                onSelectSubItem={handleSelectSubItem}
                onNewChat={handleNewChat}
                hasMore={hasMore}
                isLoading={isLoading}
                user={user}
            />
        </div>
    );
}

export default App;
