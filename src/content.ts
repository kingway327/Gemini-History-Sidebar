// 监听来自弹窗的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'GET_GEMINI_HISTORY') {
        const history = extractGeminiHistory();
        sendResponse({ success: true, data: history });
    }
    else if (request.action === 'GET_CONVERSATION_SUBITEMS') {
        const subItems = extractConversationSubItems();
        sendResponse({ success: true, data: subItems });
    }
    else if (request.action === 'SCROLL_TO_MESSAGE') {
        scrollToMessage(request.index);
        sendResponse({ success: true });
    }
    return true;
});

/**
 * 提取当前对话中的每一次用户输入
 */
function extractConversationSubItems() {
    const subItems: any[] = [];
    const containers = document.querySelectorAll('.user-query-content, [data-test-id="user-query"], .query-content');

    containers.forEach((container, index) => {
        const text = container.textContent?.trim() || '';
        if (text) {
            container.setAttribute('data-nav-index', index.toString());
            subItems.push({
                index,
                title: text
            });
        }
    });
    return subItems;
}

/**
 * 滚动并高亮
 */
function scrollToMessage(index: number) {
    const el = document.querySelector(`[data-nav-index="${index}"]`);
    if (el) {
        isAutoScrolling = true;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const htmlEl = el as HTMLElement;
        const originalShadow = htmlEl.style.boxShadow;
        htmlEl.style.transition = 'box-shadow 0.3s ease';
        htmlEl.style.boxShadow = '0 0 0 5px rgba(59, 130, 246, 0.4)';

        setTimeout(() => {
            htmlEl.style.boxShadow = originalShadow;
            isAutoScrolling = false;
        }, 1000);

        updateActiveIndicator(index);
    }
}

/**
 * 更新高亮状态并同步侧边栏滚动
 */
function updateActiveIndicator(index: number) {
    if (currentActiveIndex === index) return;
    currentActiveIndex = index;

    document.querySelectorAll('.gemini-nav-indicator').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-index') === index.toString());
    });

    document.querySelectorAll('.gemini-nav-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-index') === index.toString());
    });

    const activeItem = document.querySelector(`.gemini-nav-item.active`) as HTMLElement;
    const listContainer = document.getElementById('gemini-nav-list');
    if (activeItem && listContainer) {
        const containerRect = listContainer.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();

        if (itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

/**
 * 提取历史记录
 */
function extractGeminiHistory() {
    const sessions: any[] = [];
    const seenIds = new Set();
    const links = document.querySelectorAll('a');

    links.forEach((a) => {
        const href = a.getAttribute('href') || '';
        const match = href.match(/\/app\/([a-zA-Z0-9_-]{8,})/);
        if (match && match[1]) {
            const id = match[1];
            if (seenIds.has(id)) return;
            if (['settings', 'faq', 'updates', 'app', 'prompt', 'activity'].includes(id.toLowerCase())) return;
            let title = a.innerText.split('\n')[0].trim();
            if (!title) title = a.getAttribute('aria-label') || '';
            const strictBlackList = ['主菜单', 'Gemini', 'PRO', '新对话', '设置', '帮助', '活动', '升级'];
            if (!title || title.length < 2 || strictBlackList.includes(title)) return;
            seenIds.add(id);
            sessions.push({ id, title, updatedAt: new Date().toISOString() });
        }
    });

    // 提取用户信息
    let userInfo = { name: 'Gemini User', plan: 'Free' };
    const userButton = document.querySelector('button[aria-label*="Google 帐号"], img[src*="googleusercontent.com"]');
    if (userButton) {
        const label = userButton.getAttribute('aria-label') || '';
        const nameMatch = label.match(/：(.+?)\n/);
        if (nameMatch) {
            userInfo.name = nameMatch[1];
        } else if (label.includes('：')) {
            userInfo.name = label.split('：')[1].split('(')[0].trim();
        }
    }

    // 尝试提取 Plan 信息 (Gemini Advanced 等)
    const planEl = document.querySelector('.plan-badge, [aria-label*="Advanced"]');
    if (planEl) {
        userInfo.plan = 'Gemini Advanced';
    } else if (document.body.innerText.includes('Advanced')) {
        userInfo.plan = 'Gemini Advanced';
    }

    return { sessions, userInfo };
}

let isPinned = false;
let isAutoScrolling = false;
let currentActiveIndex: number | null = null;
let scrollObserver: IntersectionObserver | null = null;

/**
 * 注入嵌入式浮动导航栏
 */
function injectFloatingNavbar() {
    if (document.getElementById('gemini-nav-container')) return;

    const container = document.createElement('div');
    container.id = 'gemini-nav-container';

    const indicatorColumn = document.createElement('div');
    indicatorColumn.id = 'gemini-nav-indicators';

    const panel = document.createElement('div');
    panel.id = 'gemini-nav-panel';
    panel.innerHTML = `
    <div style="padding: 14px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; height: 48px; box-sizing: border-box;">
      <span style="font-weight: 600; font-size: 16px; color: #374151;">当前对话导航</span>
      <button id="gemini-nav-pin" style="background: none; border: none; cursor: pointer; padding: 5px; border-radius: 5px; transition: background 0.2s;" title="固定侧边栏">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #9CA3AF;"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><path d="m16.5 9.4 4.5 4.5"></path><path d="M21 13.9v4.5"></path><path d="M16.5 18.4v-4.5"></path></svg>
      </button>
    </div>
    <div id="gemini-nav-list" style="padding: 5px 0; max-height: 480px; overflow-y: auto; scroll-behavior: smooth;">
    </div>
  `;

    const style = document.createElement('style');
    style.textContent = `
    #gemini-nav-container {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10000;
      display: flex;
      align-items: flex-start;
      gap: 0;
    }
    #gemini-nav-indicators {
      display: flex;
      flex-direction: column;
      padding: 5px 7px;
      background: transparent;
      pointer-events: auto;
      margin-top: 48px; 
      max-height: 480px;
      overflow: hidden;
    }
    .gemini-nav-indicator {
      width: 28px;
      height: 38px; 
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      color: #D1D5DB;
    }
    .gemini-nav-indicator svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    .gemini-nav-indicator.active {
      color: #3B82F6;
      filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.6));
    }
    #gemini-nav-panel {
      width: 216px; 
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(0,0,0,0.1);
      border-right: none;
      border-top-left-radius: 14px;
      border-bottom-left-radius: 14px;
      box-shadow: -5px 0 18px rgba(0,0,0,0.08);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      transform: translateX(100%);
      opacity: 0;
      overflow: hidden;
      order: -1;
    }
    #gemini-nav-container:hover #gemini-nav-panel,
    #gemini-nav-container.pinned #gemini-nav-panel {
      transform: translateX(0);
      opacity: 1;
    }
    .gemini-nav-item {
      height: 38px; 
      padding: 0 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      font-size: 14px; 
      color: #4B5563;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-sizing: border-box;
    }
    .gemini-nav-item:hover, .gemini-nav-item.active {
      background: rgba(59, 130, 246, 0.05);
      color: #2563EB;
    }
    #gemini-nav-pin.active svg {
      color: #3B82F6 !important;
      fill: rgba(59, 130, 246, 0.1);
    }
    #gemini-nav-list::-webkit-scrollbar { width: 0; }
  `;

    document.head.appendChild(style);
    container.appendChild(panel);
    container.appendChild(indicatorColumn);
    document.body.appendChild(container);

    const pinBtn = document.getElementById('gemini-nav-pin');
    pinBtn?.addEventListener('click', () => {
        isPinned = !isPinned;
        container.classList.toggle('pinned', isPinned);
        pinBtn.classList.toggle('active', isPinned);
    });

    const listEl = document.getElementById('gemini-nav-list');
    const indicatorsEl = document.getElementById('gemini-nav-indicators');
    if (listEl && indicatorsEl) {
        listEl.addEventListener('scroll', () => {
            indicatorsEl.scrollTop = listEl.scrollTop;
        });
    }

    setupScrollObserver();

    const updateList = () => {
        const listContainer = document.getElementById('gemini-nav-list');
        const indicatorsContainer = document.getElementById('gemini-nav-indicators');
        if (!listContainer || !indicatorsContainer) return;

        const subItems = extractConversationSubItems();
        if (subItems.length === 0) {
            listContainer.innerHTML = '<div style="padding: 14px; font-size: 13px; color: #9CA3AF; text-align: center;">暂无导航点</div>';
            indicatorsContainer.innerHTML = '';
            return;
        }

        listContainer.innerHTML = subItems.map(item => `
      <div class="gemini-nav-item ${currentActiveIndex === item.index ? 'active' : ''}" data-index="${item.index}" title="${item.title.replace(/"/g, '&quot;')}">
        ${item.title.length > 12 ? item.title.substring(0, 12) + '...' : item.title}
      </div>
    `).join('');

        const starSvg = `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
        indicatorsContainer.innerHTML = subItems.map(item => `
      <div class="gemini-nav-indicator ${currentActiveIndex === item.index ? 'active' : ''}" data-index="${item.index}" title="${item.title.replace(/"/g, '&quot;')}">
        ${starSvg}
      </div>
    `).join('');

        const handleItemClick = (el: Element) => {
            const index = parseInt(el.getAttribute('data-index') || '0');
            scrollToMessage(index);
        };

        listContainer.querySelectorAll('.gemini-nav-item').forEach(el => {
            el.addEventListener('click', () => handleItemClick(el));
        });
        indicatorsContainer.querySelectorAll('.gemini-nav-indicator').forEach(el => {
            el.addEventListener('click', () => handleItemClick(el));
        });

        document.querySelectorAll('[data-nav-index]').forEach(el => scrollObserver?.observe(el));
    };

    updateList();
    setInterval(updateList, 3000);
}

/**
 * 设置滚动监听观察器
 */
function setupScrollObserver() {
    if (scrollObserver) scrollObserver.disconnect();

    scrollObserver = new IntersectionObserver((entries) => {
        if (isAutoScrolling) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = entry.target.getAttribute('data-nav-index');
                if (index !== null) {
                    updateActiveIndicator(parseInt(index));
                }
            }
        });
    }, {
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0
    });

    document.querySelectorAll('[data-nav-index]').forEach(el => scrollObserver?.observe(el));
}

if (document.readyState === 'complete') {
    injectFloatingNavbar();
} else {
    window.addEventListener('load', injectFloatingNavbar);
}
