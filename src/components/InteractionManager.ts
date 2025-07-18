// import { Sidebar } from "./components/Sidebar";
// import { Content } from "./components/Content";
// import { docData } from "../data/docData";

export class InteractionManager {
//   private sidebar: Sidebar;
//   private content: Content;
//   private addMenuBtn: HTMLButtonElement | null;

  constructor() {
    // this.sidebar = new Sidebar(containerId);
    // this.content = new Content(containerId);
    // this.addMenuBtn = document.querySelector(".add-menu-btn");

    // this.setupEventListeners();
  }

//   private setupEventListeners() {
//     if (this.addMenuBtn) {
//       this.addMenuBtn.addEventListener("click", () => this.handleAddMenu());
//     }

//     // 模拟 nav-change 事件
//     this.sidebar.getNavList().addEventListener("click", (e: Event) => {
//       const target = e.target as HTMLElement;
//       const path = target.dataset.path;
//       if (path) {
//         this.handleNavChange(path);
//       }
//     });

//     this.sidebar.getNavList().addEventListener("contextmenu", (e: Event) => {
//       e.preventDefault();
//       this.handleContextMenu(e);
//     });
//   }

//   private handleAddMenu() {
//     const title = prompt("Enter menu title:");
//     if (title) {
//       const newItem = docData.addMenuItem(title);
//       this.sidebar.renderNav(docData.getMenus());
//       this.handleNavChange(newItem.path);
//     }
//   }

//   private handleNavChange(path: string) {
//     this.content.renderContent(path);
//   }

//   private handleContextMenu(e: Event) {
//     const target = e.target as HTMLElement;
//     const menuId = target.dataset.id;
//     const isTopLevel = target.parentElement === this.sidebar.getNavList();

//     const menu = document.createElement("div");
//     menu.className = "context-menu";
//     menu.style.position = "absolute";
//     menu.style.left = `${e.clientX}px`;
//     menu.style.top = `${e.clientY}px`;
//     menu.innerHTML = `
//       <ul>
//         <li data-action="add-child">Add Submenu</li>
//         ${isTopLevel ? '<li data-action="add-top">Add Top Menu</li>' : ''}
//         <li data-action="edit">Edit Menu</li>
//         <li data-action="delete">Delete Menu</li>
//       </ul>
//     `;

//     document.body.appendChild(menu);

//     menu.addEventListener("click", (ev: Event) => {
//       const action = (ev.target as HTMLElement).dataset.action;
//       if (action === "add-child" && menuId) {
//         this.handleAddMenu(menuId);
//       } else if (action === "add-top") {
//         this.handleAddMenu();
//       } else if (action === "edit" && menuId) {
//         this.handleEditMenu(menuId);
//       } else if (action === "delete" && menuId) {
//         this.handleDeleteMenu(menuId);
//       }
//       menu.remove();
//     });

//     document.addEventListener("click", () => menu.remove(), { once: true });
//   }

//   private handleAddMenu(parentId?: string) {
//     const title = prompt("Enter menu title:");
//     if (title) {
//       const newItem = docData.addMenuItem(title, parentId);
//       this.sidebar.renderNav(docData.getMenus());
//       this.handleNavChange(newItem.path);
//       const newLi = this.sidebar.getNavList().querySelector(`[data-id="${newItem.id}"]`);
//       if (newLi) {
//         newLi.classList.add("new-item");
//         setTimeout(() => newLi.classList.remove("new-item"), 2000);
//       }
//     }
//   }

//   private handleEditMenu(id: string) {
//     const item = docData.findItemById(docData.getMenus(), id);
//     if (item) {
//       const newTitle = prompt("Edit menu title:", item.title);
//       if (newTitle) {
//         docData.editMenuItem(id, newTitle);
//         this.sidebar.renderNav(docData.getMenus());
//         this.handleNavChange(item.path);
//       }
//     }
//   }

//   private handleDeleteMenu(id: string) {
//     if (confirm("Delete this menu and its submenus?")) {
//       docData.deleteMenuItem(id);
//       this.sidebar.renderNav(docData.getMenus());
//       if (docData.getMenus().length > 0) {
//         this.handleNavChange(docData.getMenus()[0].path);
//       } else {
//         this.handleNavChange("");
//       }
//     }
//   }
}