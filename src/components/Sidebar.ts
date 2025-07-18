import type { MenuItem } from "../data/docData";

export class Sidebar {
  private container: HTMLElement;
  private navList: HTMLElement;

  constructor(containerId: string) {
    this.container = document.createElement("div");
    this.container.className = "sidebar";

    const header = document.createElement("div");
    header.className = "sidebar-header";
    header.textContent = "Notes";
    this.container.appendChild(header);

    this.navList = document.createElement("ul");
    this.navList.className = "sidebar-nav";
    this.container.appendChild(this.navList);

    const target = document.getElementById(containerId);
    if (target) {
      target.appendChild(this.container);
    } else {
      console.error(`Container with ID "${containerId}" not found.`);
    }
  }

  public renderNav(items: MenuItem[]) {
    this.navList.innerHTML = "";
    const setDraggable = (li: HTMLElement) => {
      li.setAttribute('draggable', 'true');
    };
    const render = (items: MenuItem[], parent: HTMLElement) => {
      items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.title;
        li.dataset.path = item.path;
        li.dataset.id = item.id;
        li.className = item.children?.length ? "has-children" : "";
        setDraggable(li);
        if (item.children?.length) {
          const subList = document.createElement("ul");
          subList.className = "sidebar-subnav";
          render(item.children, subList);
          li.appendChild(subList);
          li.classList.add("expanded");
        }
        parent.appendChild(li);
      });
    };
    render(items, this.navList);
    this.setupDragSort();
  }
  // 拖拽排序功能，排序后触发 onSort 回调
  private dragSrcId: string | null = null;
  private dragOverId: string | null = null;
  public onSort: ((srcId: string, targetId: string) => void) | null = null;

  private setupDragSort() {
    const nav = this.navList;
    nav.querySelectorAll('li[data-id]').forEach(li => {
      (li as HTMLElement).setAttribute('draggable', 'true');
    });
    nav.ondragstart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.dataset.id) {
        this.dragSrcId = target.dataset.id;
        e.dataTransfer?.setData('text/plain', this.dragSrcId);
        target.classList.add('dragging');
      }
    };
    nav.ondragend = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target) target.classList.remove('dragging');
      this.dragSrcId = null;
      this.dragOverId = null;
    };
    nav.ondragover = (e: DragEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (target && target.dataset.id) {
        this.dragOverId = target.dataset.id;
        target.classList.add('drag-over');
      }
    };
    nav.ondragleave = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target) target.classList.remove('drag-over');
    };
    nav.ondrop = (e: DragEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (!this.dragSrcId || !target || !target.dataset.id || this.dragSrcId === target.dataset.id) return;
      this.dragOverId = target.dataset.id;
      if (this.onSort) {
        this.onSort(this.dragSrcId, this.dragOverId);
      }
      nav.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    };
  }

  private renderSubNav(items: MenuItem[], parent: HTMLElement) {
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.title;
            li.dataset.id = item.id;
            li.dataset.path = item.path;
            parent.appendChild(li);
            if (item.children && item.children.length > 0) {
                const subUl = document.createElement("ul");
                subUl.className = "sidebar-subnav";
                this.renderSubNav(item.children, subUl);
                li.appendChild(subUl);
            }
    });
  }

  public getNavList(): HTMLElement {
    return this.navList;
  }
}