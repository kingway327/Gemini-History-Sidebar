import { ChatSession } from '../types/chat';

/**
 * 判断日期是否是今天
 */
const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

/**
 * 判断日期是否是昨天
 */
const isYesterday = (date: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    );
};

/**
 * 判断日期是否在近7天内（不包括今天和昨天）
 */
const isWithinLast7Days = (date: Date): boolean => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // 排除今天和昨天
    if (isToday(date) || isYesterday(date)) {
        return false;
    }

    return date >= sevenDaysAgo && date <= now;
};

/**
 * 将会话列表按日期分组
 * 分组顺序：今天 -> 昨天 -> 近7天 -> 按月份（倒序）
 */
export const groupSessionsByDate = (
    sessions: ChatSession[]
): Array<[string, ChatSession[]]> => {
    const groups: Record<string, ChatSession[]> = {};

    sessions.forEach((session) => {
        const date = new Date(session.updatedAt);
        let groupKey = '';

        if (isToday(date)) {
            groupKey = '今天';
        } else if (isYesterday(date)) {
            groupKey = '昨天';
        } else if (isWithinLast7Days(date)) {
            groupKey = '近7天';
        } else {
            // 按月份分组
            groupKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(session);
    });

    // 定义排序优先级
    const sortOrder = ['今天', '昨天', '近7天'];

    return Object.entries(groups).sort((a, b) => {
        const indexA = sortOrder.indexOf(a[0]);
        const indexB = sortOrder.indexOf(b[0]);

        // 如果都在自定义排序列表中
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // 如果其中一个在列表中，排在前面
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        // 剩下的按字符串降序（即月份倒序 2026年1月 -> 2025年12月）
        return b[0].localeCompare(a[0]);
    });
};
