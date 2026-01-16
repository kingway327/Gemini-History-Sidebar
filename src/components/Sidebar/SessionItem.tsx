import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Trash2, Pencil, Check, X } from 'lucide-react';
import { SessionItemProps } from '../../types/chat';

/**
 * 单个会话项组件
 * 支持：选中、删除、重命名
 */
export const SessionItem: React.FC<SessionItemProps> = ({
    session,
    isActive,
    onSelect,
    onSelectSubItem,
    onDelete,
    onRename,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(session.title);
    const inputRef = useRef<HTMLInputElement>(null);

    // 进入编辑模式时自动聚焦
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // 处理重命名确认
    const handleRenameConfirm = () => {
        const trimmedTitle = editTitle.trim();
        if (trimmedTitle && trimmedTitle !== session.title && onRename) {
            onRename(session.id, trimmedTitle);
        }
        setIsEditing(false);
    };

    // 处理重命名取消
    const handleRenameCancel = () => {
        setEditTitle(session.title);
        setIsEditing(false);
    };

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameConfirm();
        } else if (e.key === 'Escape') {
            handleRenameCancel();
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={() => !isEditing && onSelect(session.id)}
                className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors duration-200
          ${isActive ? 'bg-blue-100/60 text-blue-700' : 'text-gray-700 hover:bg-gray-200/60'}
        `}
            >
                <MessageSquare
                    className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                />

                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleRenameConfirm}
                        className="flex-1 px-1 py-0.5 text-sm bg-white border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-400"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="truncate-title">{session.title}</span>
                )}
            </button>

            {/* 操作菜单 (悬停显示) */}
            {!isEditing && (onDelete || onRename) && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* 重命名按钮 */}
                    {onRename && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="p-1 hover:bg-gray-300 rounded text-gray-400 hover:text-blue-500"
                            title="重命名"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* 删除按钮 */}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(session.id);
                            }}
                            className="p-1 hover:bg-gray-300 rounded text-gray-400 hover:text-red-500"
                            title="删除对话"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* 编辑模式操作按钮 */}
            {isEditing && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRenameConfirm();
                        }}
                        className="p-1 hover:bg-green-100 rounded text-green-500"
                        title="确认"
                    >
                        <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRenameCancel();
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-500"
                        title="取消"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
            {/* 子项列表 (页面内导航) */}
            {isActive && session.subItems && session.subItems.length > 0 && (
                <div className="mt-1 ml-7 space-y-1 border-l border-gray-200 pl-3">
                    {session.subItems.map((subItem) => (
                        <button
                            key={subItem.index}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectSubItem?.(subItem.index);
                            }}
                            className="block w-full text-left text-xs py-1.5 text-gray-500 hover:text-blue-600 transition-colors truncate"
                            title={subItem.title}
                        >
                            {subItem.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
