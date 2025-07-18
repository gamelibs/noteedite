import Swal from 'sweetalert2';

export interface NoteContent {
  title: string;
  content: string; // 笔记内容（后续可扩展为 Markdown）
}

export interface MenuItem {
  id: string; // 唯一 ID
  title: string; // 菜单标题
  path: string; // 导航路径
  content?: NoteContent; // 笔记内容
  children?: MenuItem[]; // 子菜单
}

export class DocData {
  private static instance: DocData;
  private data: { version: string; menus: MenuItem[] };
  private initialMenus: string; // 存储初始菜单状态用于退出前检查
  private saveBtn: HTMLButtonElement | null;

  private constructor() {
    this.data = {
      version: "1.0.0",
      menus: [],
    };
    this.initialMenus = '';
    this.saveBtn = null;
  }

  static getInstance(): DocData {
    if (!DocData.instance) {
      DocData.instance = new DocData();
    }
    return DocData.instance;
  }

  // 初始化保存按钮
  setSaveButton(saveBtn: HTMLButtonElement): void {
    this.saveBtn = saveBtn;
    this.setSaveButtonVisible(false); // 默认隐藏
  }

  // 控制保存按钮显示/隐藏
  private setSaveButtonVisible(visible: boolean): void {
    if (this.saveBtn) {
      this.saveBtn.style.display = visible ? 'inline-block' : 'none';
    }
  }

  // 加载初始数据
  async loadInitialData(): Promise<void> {
    // 先用本地数据渲染
    const stored = localStorage.getItem('menus');
    let menus: MenuItem[] = [];
    if (stored) {
      menus = JSON.parse(stored);
      this.setMenus(menus);
      this.initialMenus = JSON.stringify(menus);
      localStorage.setItem('menus', this.initialMenus);
    }
    // 异步拉取远程数据，合并并刷新
    try {
      const response = await fetch("http://localhost:19200/get-notes");
      if (response.ok) {
        const data = await response.json();
        const remoteMenus = data.menus || [];
        // 合并策略：用远程数据覆盖本地（如需自定义合并可调整）
        this.setMenus(remoteMenus);
        this.initialMenus = JSON.stringify(remoteMenus);
        localStorage.setItem('menus', this.initialMenus);
        // window.dispatchEvent(new CustomEvent('menusChanged'));
        console.log("远程数据同步成功");
      } else {
        console.warn("No notes file found, starting with empty data.");
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      // 只在本地和远程都没有数据时弹窗
      if (!stored) {
        await Swal.fire({
          icon: 'error',
          title: '加载失败',
          text: '初始数据加载错误，请检查网络或服务器。',
          confirmButtonText: '确定',
        });
      }
    }
  }

  // 保存笔记到服务器
  async saveNotesToJson(): Promise<void> {
    const notes = this.getMenus();
    const jsonData = JSON.stringify(notes, null, 2);

    try {
      const response = await fetch("http://localhost:19200/save-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Status ${response.status}`);
      }
      // 同步成功
      await Swal.fire({
        icon: 'success',
        title: '保存成功',
        text: '笔记已成功保存到云端！',
        confirmButtonText: '确定',
      });
      // 更新本地状态
      this.setMenus(result.menus || []);
      this.initialMenus = JSON.stringify(this.getMenus());
      localStorage.setItem('menus', this.initialMenus);
      this.setSaveButtonVisible(false);
    } catch (error: any) {
      console.error("Error saving notes:", error);
      await Swal.fire({
        icon: 'error',
        title: '保存失败',
        text: `无法保存笔记：${error.message}`,
        confirmButtonText: '确定',
      });
    }
  }

  // 监听菜单变化
  notifyMenusChanged(): void {
    localStorage.setItem('menus', JSON.stringify(this.getMenus()));
    this.setSaveButtonVisible(true);
    window.dispatchEvent(new CustomEvent('menusChanged'));
  }

  // 检查未同步的更改
  hasUnsyncedChanges(): boolean {
    return JSON.stringify(this.getMenus()) !== this.initialMenus;
  }

  getMenus(): MenuItem[] {
    return this.data.menus;
  }

  setMenus(menus: MenuItem[]): void {
    this.data.menus = menus;
  }

  addMenuItem(title: string, parentId?: string): MenuItem {
    const id = crypto.randomUUID();
    const path = parentId ? `${this.findItemPath(parentId)}/${id}` : `/${id}`;
    const newItem: MenuItem = { id, title, path, content: { title, content: "" }, children: [] };

    if (parentId) {
      const parent = this.findItemById(this.data.menus, parentId);
      if (parent && parent.children) {
        parent.children.push(newItem);
      }
    } else {
      this.data.menus.push(newItem);
    }
    this.notifyMenusChanged();
    return newItem;
  }

  editMenuItem(id: string, newTitle: string): boolean {
    const item = this.findItemById(this.data.menus, id);
    if (item) {
      item.title = newTitle;
      if (item.content) {
        item.content.title = newTitle;
      }
      this.notifyMenusChanged();
      return true;
    }
    return false;
  }

  deleteMenuItem(id: string): boolean {
    const parent = this.findParentById(this.data.menus, id);
    if (parent) {
      parent.children = parent.children?.filter((item) => item.id !== id) || [];
      this.notifyMenusChanged();
      return true;
    }
    this.data.menus = this.data.menus.filter((item) => item.id !== id);
    this.notifyMenusChanged();
    return true;
  }

  updateContent(id: string, content: string): boolean {
    const item = this.findItemById(this.data.menus, id);
    if (item && item.content) {
      item.content.content = content;
      this.notifyMenusChanged();
      return true;
    }
    return false;
  }

  findItemById(items: MenuItem[], id: string): MenuItem | null {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children?.length) {
        const result = this.findItemById(item.children, id);
        if (result) return result;
      }
    }
    return null;
  }

  private findParentById(items: MenuItem[], id: string): MenuItem | null {
    for (const item of items) {
      if (item.children?.some((child) => child.id === id)) return item;
      if (item.children?.length) {
        const result = this.findParentById(item.children, id);
        if (result) return result;
      }
    }
    return null;
  }

  private findItemPath(id: string): string {
    const item = this.findItemById(this.data.menus, id);
    return item ? item.path : "";
  }
}

export const docData = DocData.getInstance();