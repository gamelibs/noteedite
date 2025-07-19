export class MobileManager {
    private startX: number = 0;
    private startY: number = 0;
    private isMobile: boolean = false;
    private sidebar: HTMLElement | null = null;
    private overlay: HTMLElement | null = null;

    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    private init() {
        if (!this.isMobile) return;
        
        this.createMobileNav();
        this.createOverlay();
        this.initGestureSupport();
        this.initTouchOptimization();
    }

    private createMobileNav() {
        const topbar = document.querySelector('.topbar .toolbar');
        if (!topbar) return;

        // 创建移动端导航
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        mobileNav.innerHTML = `
            <button class="menu-toggle" id="menuToggle" aria-label="打开菜单">☰</button>
            <span class="mobile-title">简约笔记</span>
            <button class="mobile-add-btn" id="mobileAddBtn" aria-label="添加笔记">+</button>
        `;

        // 插入到工具栏开头
        topbar.insertBefore(mobileNav, topbar.firstChild);

        // 绑定事件
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('mobileAddBtn')?.addEventListener('click', () => {
            this.triggerAddNote();
        });
    }

    private createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        document.body.appendChild(this.overlay);

        // 点击遮罩关闭侧边栏
        this.overlay.addEventListener('click', () => {
            this.closeSidebar();
        });
    }

    private initGestureSupport() {
        this.sidebar = document.querySelector('.sidebar');
        
        // 触摸事件监听
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

        // 键盘事件监听（ESC键关闭侧边栏）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebar();
            }
        });
    }

    private handleTouchStart(e: TouchEvent) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
    }

    private handleTouchMove(e: TouchEvent) {
        if (!this.startX || !this.startY) return;

        const deltaX = e.touches[0].clientX - this.startX;
        const deltaY = e.touches[0].clientY - this.startY;

        // 检测水平滑动（左滑打开，右滑关闭）
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
            e.preventDefault(); // 防止页面滚动

            if (deltaX > 50) {
                // 右滑打开侧边栏
                this.openSidebar();
            } else if (deltaX < -50) {
                // 左滑关闭侧边栏
                this.closeSidebar();
            }
        }
    }

    private handleTouchEnd() {
        this.startX = 0;
        this.startY = 0;
    }

    private initTouchOptimization() {
        // 优化长按菜单项
        const menuItems = document.querySelectorAll('.sidebar-nav li');
        menuItems.forEach(item => {
            let longPressTimer: number | null = null;
            
            item.addEventListener('touchstart', (e) => {
                longPressTimer = window.setTimeout(() => {
                    this.showContextMenu(e as TouchEvent, item as HTMLElement);
                }, 500);
            });

            item.addEventListener('touchend', () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });

            item.addEventListener('touchmove', () => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
        });
    }

    private showContextMenu(e: TouchEvent, item: HTMLElement) {
        e.preventDefault();
        
        // 创建移动端上下文菜单
        const menu = document.createElement('div');
        menu.className = 'mobile-context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="edit">编辑</div>
            <div class="context-menu-item" data-action="delete">删除</div>
            <div class="context-menu-item" data-action="add-child">添加子项</div>
        `;

        // 设置菜单位置
        const rect = item.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.zIndex = '1001';

        document.body.appendChild(menu);

        // 绑定菜单事件
        menu.addEventListener('click', (e) => {
            const action = (e.target as HTMLElement).dataset.action;
            if (action) {
                this.handleContextAction(action, item);
            }
            menu.remove();
        });

        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 100);
    }

    private handleContextAction(action: string, item: HTMLElement) {
        const menuId = item.dataset.id;
        if (!menuId) return;

        switch (action) {
            case 'edit':
                this.editMenuItem(menuId);
                break;
            case 'delete':
                this.deleteMenuItem(menuId);
                break;
            case 'add-child':
                this.addChildMenuItem(menuId);
                break;
        }
    }

    private editMenuItem(menuId: string) {
        const item = document.querySelector(`[data-id="${menuId}"]`) as HTMLElement;
        if (!item) return;

        const currentTitle = item.textContent?.trim() || '';
        const newTitle = prompt('编辑标题:', currentTitle);
        
        if (newTitle && newTitle !== currentTitle) {
            // 触发编辑事件
            const event = new CustomEvent('editMenuItem', {
                detail: { id: menuId, title: newTitle }
            });
            document.dispatchEvent(event);
        }
    }

    private deleteMenuItem(menuId: string) {
        if (confirm('确定要删除这个菜单项吗？')) {
            // 触发删除事件
            const event = new CustomEvent('deleteMenuItem', {
                detail: { id: menuId }
            });
            document.dispatchEvent(event);
        }
    }

    private addChildMenuItem(parentId: string) {
        const title = prompt('请输入子菜单标题:');
        if (title) {
            // 触发添加子菜单事件
            const event = new CustomEvent('addChildMenuItem', {
                detail: { parentId, title }
            });
            document.dispatchEvent(event);
        }
    }

    private triggerAddNote() {
        // 触发添加笔记事件
        const event = new CustomEvent('addNote');
        document.dispatchEvent(event);
    }

    public toggleSidebar() {
        if (this.sidebar?.classList.contains('open')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    public openSidebar() {
        this.sidebar?.classList.add('open');
        this.overlay?.classList.add('open');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    public closeSidebar() {
        this.sidebar?.classList.remove('open');
        this.overlay?.classList.remove('open');
        document.body.style.overflow = ''; // 恢复滚动
    }

    // 监听窗口大小变化
    public handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        // 如果从桌面切换到移动端，初始化移动端功能
        if (!wasMobile && this.isMobile) {
            this.init();
        }
        
        // 如果从移动端切换到桌面端，关闭侧边栏
        if (wasMobile && !this.isMobile) {
            this.closeSidebar();
        }
    }
} 