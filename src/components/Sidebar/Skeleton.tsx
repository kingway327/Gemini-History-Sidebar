import React from 'react';

/**
 * 骨架屏组件 - 数据加载时显示的占位元素
 */
export const Skeleton: React.FC = () => {
    return (
        <div className="px-3 py-4 space-y-4">
            {/* 分组骨架 1 */}
            <div className="space-y-2">
                <div className="h-3 w-12 skeleton-shimmer rounded" />
                <div className="space-y-1">
                    <div className="h-9 skeleton-shimmer rounded-lg" />
                    <div className="h-9 skeleton-shimmer rounded-lg" />
                    <div className="h-9 skeleton-shimmer rounded-lg" />
                </div>
            </div>

            {/* 分组骨架 2 */}
            <div className="space-y-2">
                <div className="h-3 w-10 skeleton-shimmer rounded" />
                <div className="space-y-1">
                    <div className="h-9 skeleton-shimmer rounded-lg" />
                    <div className="h-9 skeleton-shimmer rounded-lg" />
                </div>
            </div>

            {/* 分组骨架 3 */}
            <div className="space-y-2">
                <div className="h-3 w-16 skeleton-shimmer rounded" />
                <div className="space-y-1">
                    <div className="h-9 skeleton-shimmer rounded-lg" />
                    <div className="h-9 skeleton-shimmer rounded-lg" />
                    <div className="h-9 skeleton-shimmer rounded-lg" />
                    <div className="h-9 skeleton-shimmer rounded-lg" />
                </div>
            </div>
        </div>
    );
};
