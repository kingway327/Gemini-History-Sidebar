import React, { useMemo, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { SidebarProps } from '../../types/chat';
import { groupSessionsByDate } from '../../utils/dateGrouping';
import { SessionItem } from './SessionItem';
import { Skeleton } from './Skeleton';

/**
 * Sidebar 主组件
 * 展示 AI 对话历史记录的侧边栏
 */
export const Sidebar: React.FC<SidebarProps> = ({
    sessions,
    activeId,
    onSelectSession,
    onSelectSubItem,
    onNewChat,
    onDeleteSession,
    onRenameSession,
    onLoadMore,
    hasMore = false,
    isLoading = false,
    user = { name: 'User' },
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // 使用 useMemo 缓存分组结果
    const groupedSessions = useMemo(
        () => groupSessionsByDate(sessions),
        [sessions]
    );

    // 无限滚动：检测滚动到底部
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current || !onLoadMore || !hasMore || isLoading) {
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        // 距离底部 50px 时触发加载
        if (scrollHeight - scrollTop - clientHeight < 50) {
            onLoadMore();
        }
    }, [onLoadMore, hasMore, isLoading]);

    return (
        <aside className="flex flex-col w-full h-full bg-[#F9FAFB] border-r border-gray-200">
            {/* --- 1. Header: 新建对话 --- */}
            <div className="flex-none p-4">
                <button
                    onClick={onNewChat}
                    className="flex items-center gap-2 w-full px-3 py-2.5 bg-white text-gray-700 text-sm font-medium border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all group"
                >
                    <Plus className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                    <span>开启新对话</span>
                </button>
            </div>

            {/* --- 2. Scrollable List: 对话列表 --- */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar"
            >
                {isLoading && sessions.length === 0 ? (
                    // 初始加载时显示骨架屏
                    <Skeleton />
                ) : (
                    <>
                        {groupedSessions.map(([groupName, items]) => (
                            <div key={groupName} className="mb-5">
                                {/* 分组标题 */}
                                <div className="px-3 py-2 text-xs font-semibold text-gray-400 select-none">
                                    {groupName}
                                </div>

                                {/* 会话 Items */}
                                <div className="space-y-0.5">
                                    {items.map((session) => (
                                        <SessionItem
                                            key={session.id}
                                            session={session}
                                            isActive={activeId === session.id}
                                            onSelect={onSelectSession}
                                            onSelectSubItem={onSelectSubItem}
                                            onDelete={onDeleteSession}
                                            onRename={onRenameSession}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* 加载更多指示器 */}
                        {isLoading && sessions.length > 0 && (
                            <div className="py-4 flex justify-center">
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                        )}

                        {/* 无更多数据提示 */}
                        {!hasMore && sessions.length > 0 && (
                            <div className="py-3 text-center text-xs text-gray-400">
                                已加载全部对话
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- 3. Footer: 用户信息 --- */}
            <div className="flex-none p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors">
                    {/* 头像 */}
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover shadow-sm"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* 用户名 */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                            {user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">Gemini Pro Plan</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
