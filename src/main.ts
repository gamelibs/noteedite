import { Sidebar } from "./components/Sidebar";
import { Content } from "./components/Content";
import { docData } from "./data/docData";
import { MobileManager } from "./components/MobileManager";
import Swal from "sweetalert2";

declare global {
    interface Window {
        isNotes: boolean;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const sidebar = new Sidebar("app");
    const content = new Content("app");
    const mobileManager = new MobileManager();
    window.isNotes = false;
    let initialMenus = "";

    const addMenuBtnElement = document.querySelector(".add-menu-btn") as HTMLElement; // 添加菜单按钮
    const contentEditorElement = document.querySelector(".content-editor") as HTMLElement; //
    const saveBtnElement = document.querySelector(".save-btn") as HTMLElement; // 隐藏保存按钮
    const infoTextElement = document.querySelector(".info-text") as HTMLElement;

    const hideEditeBtn = () => {
        if (addMenuBtnElement) addMenuBtnElement.style.display = "none";
        if (infoTextElement) infoTextElement.style.display = "none";
        if (contentEditorElement) contentEditorElement.style.display = "none";
        if (saveBtnElement) saveBtnElement.style.display = "none";
    };
    const showEditeBtn = () => {
        if (addMenuBtnElement) addMenuBtnElement.style.display = "block";
        if (infoTextElement) infoTextElement.style.display = "block";
        if (contentEditorElement) contentEditorElement.style.display = "block";
        if (saveBtnElement) saveBtnElement.style.display = "block";
    };
    // 默认隐藏编辑按钮和内容编辑区域
    hideEditeBtn();


    // 加载初始数据（优先 localStorage）
    docData
        .loadInitialData()
        .then(() => {
            console.log("window", window.isNotes);
            console.log("***同步远程成功***");
            sidebar.renderNav(docData.getMenus());
            content.renderContent(docData.getMenus()[0]?.path || "");
            // 默认高亮第一个菜单项
            setTimeout(() => {
                const firstLi = sidebar.getNavList().querySelector('li[data-path]');
                if (firstLi) firstLi.classList.add('active');
            }, 0);
        })
        .catch(() => {
            console.log("***同步远程失败***");
            sidebar.renderNav(docData.getMenus());
            content.renderContent(docData.getMenus()[0]?.path || "");
            setTimeout(() => {
                const firstLi = sidebar.getNavList().querySelector('li[data-path]');
                if (firstLi) firstLi.classList.add('active');
            }, 0);
        });

    // 添加笔记按钮事件
    const addMenuBtn = document.querySelector(".add-menu-btn");
    if (addMenuBtn) {
        addMenuBtn.addEventListener("click", async () => {
            const { value: title } = await Swal.fire({
                title: "Enter menu title",
                input: "text",
                inputPlaceholder: "Menu title",
                showCancelButton: true,
                inputValidator: (v) => (v ? null : "Please enter a title"),
            });
            if (title) {
                const newItem = docData.addMenuItem(title);
                sidebar.renderNav(docData.getMenus());
                content.renderContent(newItem.path);
                currentSelectedPath = newItem.path; // 新增：同步当前选中菜单
                const newLi = sidebar.getNavList().querySelector(`[data-id="${newItem.id}"]`);
                if (newLi) {
                    newLi.classList.add("new-item");
                    setTimeout(() => newLi.classList.remove("new-item"), 2000);
                }
                localStorage.setItem("menus", JSON.stringify(docData.getMenus()));
            }
        });
    }

    // 保存同步笔记按钮
    const saveBtn = document.querySelector(".save-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            await docData.saveNotesToJson();
        });
    }

    // 当前选中菜单 path
    let currentSelectedPath: string | null = null;
    // 导航点击事件，选中项高亮
    sidebar.getNavList().addEventListener("click", (e: Event) => {
        const target = e.target as HTMLElement;
        const path = target.dataset.path;
        if (path) {
            content.renderContent(path);
            currentSelectedPath = path;
            // 移除所有active
            sidebar.getNavList().querySelectorAll('li').forEach(li => li.classList.remove('active'));
            // 当前项高亮
            target.classList.add('active');
        }
    });

    // 拖拽排序功能由 Sidebar 组件内部实现，这里只负责数据移动和保存
    sidebar.onSort = (srcId: string, targetId: string) => {
        //编辑模式可用
        if(!window.isNotes) return;
        const menus = docData.getMenus();
        function findAndMove(arr: any[]): boolean {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id === srcId) {
                    const item = arr.splice(i, 1)[0];
                    for (let j = 0; j < arr.length; j++) {
                        if (arr[j].id === targetId) {
                            arr.splice(j, 0, item);
                            return true;
                        }
                    }
                    arr.splice(i, 0, item);
                } else if (arr[i].children && arr[i].children.length) {
                    if (findAndMove(arr[i].children)) return true;
                }
            }
            return false;
        }
        if (findAndMove(menus)) {
            sidebar.renderNav(menus);
            localStorage.setItem('menus', JSON.stringify(menus));
            // 拖拽后恢复高亮
            if (currentSelectedPath) {
                const li = sidebar.getNavList().querySelector(`li[data-path="${currentSelectedPath}"]`);
                if (li) {
                    sidebar.getNavList().querySelectorAll('li').forEach(li => li.classList.remove('active'));
                    li.classList.add('active');
                }
            }
        }
    };

    // 右键菜单
    sidebar.getNavList().addEventListener("contextmenu", (e: Event) => {
        //编辑模式可用
        if(!window.isNotes) return;
        e.preventDefault();
        const target = e.target as HTMLElement;
        const menuId = target.dataset.id;
        const isTopLevel = target.parentElement === sidebar.getNavList();

        const menu = document.createElement("div");
        menu.className = "context-menu";
        menu.style.position = "absolute";
        menu.style.left = `${(e as any).clientX}px`;
        menu.style.top = `${(e as any).clientY}px`;
        menu.innerHTML = `
      <ul>
        <li data-action="add-child">Add Submenu</li>
        ${isTopLevel ? '<li data-action="add-top">Add Top Menu</li>' : ""}
        <li data-action="edit">Edit Menu</li>
        <li data-action="delete">Delete Menu</li>
      </ul>
    `;

        document.body.appendChild(menu);

        menu.addEventListener("click", async (ev: Event) => {
            const action = (ev.target as HTMLElement).dataset.action;
            if (action === "add-child" && menuId) {
                const { value: title } = await Swal.fire({
                    title: "Enter submenu title",
                    input: "text",
                    inputPlaceholder: "Submenu title",
                    showCancelButton: true,
                    inputValidator: (v) => (v ? null : "Please enter a title"),
                });
                if (title) {
                    const newItem = docData.addMenuItem(title, menuId);
                    sidebar.renderNav(docData.getMenus());
                    content.renderContent(newItem.path);
                    currentSelectedPath = newItem.path; // 新增：同步当前选中菜单
                    const newLi = sidebar.getNavList().querySelector(`[data-id="${newItem.id}"]`);
                    if (newLi) {
                        newLi.classList.add("new-item");
                        setTimeout(() => newLi.classList.remove("new-item"), 2000);
                    }
                    localStorage.setItem("menus", JSON.stringify(docData.getMenus()));
                }
            } else if (action === "add-top") {
                const { value: title } = await Swal.fire({
                    title: "Enter menu title",
                    input: "text",
                    inputPlaceholder: "Menu title",
                    showCancelButton: true,
                    inputValidator: (v) => (v ? null : "Please enter a title"),
                });
                if (title) {
                    const newItem = docData.addMenuItem(title);
                    sidebar.renderNav(docData.getMenus());
                    content.renderContent(newItem.path);
                    currentSelectedPath = newItem.path; // 新增：同步当前选中菜单
                    const newLi = sidebar.getNavList().querySelector(`[data-id="${newItem.id}"]`);
                    if (newLi) {
                        newLi.classList.add("new-item");
                        setTimeout(() => newLi.classList.remove("new-item"), 2000);
                    }
                    localStorage.setItem("menus", JSON.stringify(docData.getMenus()));
                }
            } else if (action === "edit" && menuId) {
                const item = docData.findItemById(docData.getMenus(), menuId);
                if (item) {
                    const { value: newTitle } = await Swal.fire({
                        title: "Edit menu title",
                        input: "text",
                        inputValue: item.title,
                        showCancelButton: true,
                        inputValidator: (v) => (v ? null : "Please enter a title"),
                    });
                    if (newTitle) {
                        docData.editMenuItem(menuId, newTitle);
                        sidebar.renderNav(docData.getMenus());
                        content.renderContent(item.path);
                        currentSelectedPath = item.path; // 新增：同步当前选中菜单
                        localStorage.setItem("menus", JSON.stringify(docData.getMenus()));
                    }
                }
            } else if (action === "delete" && menuId) {
                if (confirm("Delete this menu and its submenus?")) {
                    docData.deleteMenuItem(menuId);
                    sidebar.renderNav(docData.getMenus());
                    if (docData.getMenus().length > 0) {
                        content.renderContent(docData.getMenus()[0].path);
                        currentSelectedPath = docData.getMenus()[0].path; // 新增：同步当前选中菜单
                    } else {
                        content.renderContent("");
                        currentSelectedPath = null; // 新增：无菜单时清空
                    }
                    localStorage.setItem("menus", JSON.stringify(docData.getMenus()));
                }
            }
            menu.remove();
        });

        document.addEventListener("click", () => menu.remove(), { once: true });
    });

    // 退出前提示未同步的更改
    window.addEventListener("beforeunload", (e) => {
        const current = JSON.stringify(docData.getMenus());
        if (current !== initialMenus) {
            e.returnValue = "You have unsynced changes, please save to cloud.";
            return e.returnValue;
        }
    });

    // 添加模式切换逻辑
    let isEditMode = -1; // 默认模式

    const toggleHandler = () => {
        let tf = (isEditMode *= -1);
        window.isNotes = tf > 0 ? true : false;
        console.log("isNodte", window.isNotes);

        if (window.isNotes) {
            toggleModeBtn.textContent = "切换到编辑模式";
            showEditeBtn();
        } else {
            toggleModeBtn.textContent = "切换到预览模式";
            hideEditeBtn();
        }
        // 切换模式时保持在当前选中菜单
        if (currentSelectedPath) {
            content.renderContent(currentSelectedPath);
        } else {
            content.renderContent(docData.getMenus()[0]?.path || "");
        }
    };

    const toggleModeBtn = document.createElement("button");
    toggleModeBtn.textContent = "切换到编辑模式";
    toggleModeBtn.className = "toggle-mode-btn";
    document.body.appendChild(toggleModeBtn);

    toggleModeBtn.addEventListener("click", () => {
        toggleHandler();
    });

    // 添加键盘快捷键切换模式逻辑
    document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "e") {
            event.preventDefault();

            toggleHandler();

        } else if (event.key === "Escape" && window.isNotes) {
            toggleHandler();
        }
        // Ctrl+S/Cmd+S 保存

        if (window.isNotes && (event.ctrlKey || event.metaKey) && event.key === "s") {
            event.preventDefault();
            docData.saveNotesToJson();
        }
                 
    });

    // 移动端事件监听
    document.addEventListener('addNote', async () => {
        const { value: title } = await Swal.fire({
            title: "Enter menu title",
            input: "text",
            inputPlaceholder: "Menu title",
            showCancelButton: true,
            inputValidator: (v) => (v ? null : "Please enter a title"),
        });
        if (title) {
            const newItem = docData.addMenuItem(title);
            sidebar.renderNav(docData.getMenus());
            content.renderContent(newItem.path);
            currentSelectedPath = newItem.path;
            const newLi = sidebar.getNavList().querySelector(`[data-id="${newItem.id}"]`);
            if (newLi) {
                newLi.classList.add("new-item");
                setTimeout(() => newLi.classList.remove("new-item"), 2000);
            }
            localStorage.setItem("menus", JSON.stringify(docData.getMenus()));
            // 移动端添加笔记后关闭侧边栏
            mobileManager.closeSidebar();
        }
    });

    document.addEventListener('editMenuItem', ((e: Event) => {
        const customEvent = e as CustomEvent;
        const { id, title } = customEvent.detail;
        docData.editMenuItem(id, title);
        sidebar.renderNav(docData.getMenus());
        if (currentSelectedPath) {
            content.renderContent(currentSelectedPath);
        }
        localStorage.setItem("menus", JSON.stringify(docData.getMenus()));
    }) as EventListener);

    document.addEventListener('deleteMenuItem', ((e: Event) => {
        const customEvent = e as CustomEvent;
        const { id } = customEvent.detail;
        docData.deleteMenuItem(id);
        sidebar.renderNav(docData.getMenus());
        if (docData.getMenus().length > 0) {
            content.renderContent(docData.getMenus()[0].path);
            currentSelectedPath = docData.getMenus()[0].path;
        } else {
            content.renderContent("");
            currentSelectedPath = null;
        }
        localStorage.setItem("menus", JSON.stringify(docData.getMenus()));
    }) as EventListener);

    document.addEventListener('addChildMenuItem', ((e: Event) => {
        const customEvent = e as CustomEvent;
        const { parentId, title } = customEvent.detail;
        const newItem = docData.addMenuItem(title, parentId);
        sidebar.renderNav(docData.getMenus());
        content.renderContent(newItem.path);
        currentSelectedPath = newItem.path;
        const newLi = sidebar.getNavList().querySelector(`[data-id="${newItem.id}"]`);
        if (newLi) {
            newLi.classList.add("new-item");
            setTimeout(() => newLi.classList.remove("new-item"), 2000);
        }
        localStorage.setItem("menus", JSON.stringify(docData.getMenus()));
        // 移动端添加子菜单后关闭侧边栏
        mobileManager.closeSidebar();
    }) as EventListener);

    // 窗口大小变化处理
    window.addEventListener('resize', () => {
        mobileManager.handleResize();
    });

    // 移动端导航点击后关闭侧边栏
    sidebar.getNavList().addEventListener("click", (e: Event) => {
        const target = e.target as HTMLElement;
        const path = target.dataset.path;
        if (path && window.innerWidth <= 768) {
            // 移动端点击菜单项后关闭侧边栏
            setTimeout(() => {
                mobileManager.closeSidebar();
            }, 100);
        }
    });
});
