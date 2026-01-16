import React, { useEffect, useCallback } from 'react';
import { X, Menu } from 'lucide-react';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

/**
 * 移动端抽屉组件
 * 从左侧滑入，点击遮罩层或关闭按钮可关闭
 */
export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children }) => {
    // ESC 键关闭
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // 禁止背景滚动
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* 遮罩层 */}
            <div
                className="absolute inset-0 bg-black/40 transition-opacity"
                onClick={onClose}
            />

            {/* 抽屉内容 */}
            <div
                className={`
          absolute left-0 top-0 h-full w-[280px] bg-[#F9FAFB] shadow-xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors z-10"
                    title="关闭"
                >
                    <X className="w-5 h-5" />
                </button>

                {children}
            </div>
        </div>
    );
};

interface MenuButtonProps {
    onClick: () => void;
}

/**
 * 移动端汉堡菜单按钮
 */
export const MenuButton: React.FC<MenuButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors md:hidden"
            title="打开菜单"
        >
            <Menu className="w-5 h-5 text-gray-600" />
        </button>
    );
};
