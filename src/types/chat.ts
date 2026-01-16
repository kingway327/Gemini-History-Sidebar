/**
 * 对话内的小标题/导航点
 */
export interface ChatSubItem {
    index: number;
    title: string;
}

/**
 * 会话数据接口
 */
export interface ChatSession {
    id: string;
    title: string;
    updatedAt: string;
    subItems?: ChatSubItem[];
}

/**
 * Sidebar 组件 Props
 */
export interface SidebarProps {
    sessions: ChatSession[];
    activeId: string | null;
    onSelectSession: (id: string) => void;
    onSelectSubItem?: (index: number) => void;
    onNewChat: () => void;
    onDeleteSession?: (id: string) => void;
    onRenameSession?: (id: string, newTitle: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
    user?: {
        name: string;
        avatar?: string;
    };
}

/**
 * SessionItem 组件 Props
 */
export interface SessionItemProps {
    session: ChatSession;
    isActive: boolean;
    onSelect: (id: string) => void;
    onSelectSubItem?: (index: number) => void;
    onDelete?: (id: string) => void;
    onRename?: (id: string, newTitle: string) => void;
}
