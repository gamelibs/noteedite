import type { MenuItem } from "../data/docData";
import { docData } from "../data/docData";
import { marked } from "marked";

marked.setOptions({
  breaks: true, // 启用换行支持，单行回车也会转为 <br>
  gfm: true,    // 启用 GitHub 风格的 Markdown
});

export class Content {
    private container: HTMLElement;

    constructor(containerId: string) {
        this.container = document.createElement("div");
        this.container.className = "main";

        const target = document.getElementById(containerId);
        if (target) {
            target.appendChild(this.container);
        } else {
            console.error(`Container with ID "${containerId}" not found.`);
        }
    }

    public renderContent(path: string) {
        this.container.innerHTML = "";
        const item = this.findItemByPath(docData.getMenus(), path);
        if (!item) {
            this.container.innerHTML = "<p>No content available.</p>";
            return;
        }

        // 统一用 marked 解析所有内容，保证所有 markdown 语法都能实时渲染
        function renderMarkdown(text: string) {
            return String(marked.parse(text || ""));
        }

        if (window.isNotes) {
            const textarea = document.createElement("textarea");
            textarea.className = "content-editor";
            textarea.value = item.content?.content || "";
            textarea.placeholder = "Enter notes here...";

            const contentArea = document.createElement("div");
            contentArea.className = "content-area";
            contentArea.innerHTML = renderMarkdown(textarea.value || "");

            // 滚动容器，包含编辑器和预览区
            const scrollContainer = document.createElement("div");
            scrollContainer.className = "content-scroll";
            scrollContainer.appendChild(textarea);
            scrollContainer.appendChild(contentArea);
            this.container.appendChild(scrollContainer);

            // Tab 缩进支持
            textarea.addEventListener("keydown", (e) => {
                if (e.key === "Tab") {
                    e.preventDefault();
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    let newText = "";
                    let selStart = start;
                    let selEnd = end;
                    // 判断是否多行选择
                    if (start !== end && value.slice(start, end).includes("\n")) {
                        // 多行缩进或反缩进
                        const lines = value.slice(start, end).split("\n");
                        if (e.shiftKey) {
                            for (let i = 0; i < lines.length; i++) {
                                if (lines[i].startsWith("  ")) lines[i] = lines[i].slice(2);
                                else if (lines[i].startsWith("\t")) lines[i] = lines[i].slice(1);
                            }
                        } else {
                            for (let i = 0; i < lines.length; i++) {
                                lines[i] = "  " + lines[i];
                            }
                        }
                        newText = lines.join("\n");
                        selEnd = start + newText.length;
                    } else {
                        // 单行缩进或反缩进
                        if (e.shiftKey) {
                            let lineStart = value.lastIndexOf("\n", start - 1) + 1;
                            if (value.startsWith("  ", lineStart)) {
                                newText = value.slice(lineStart, start).replace(/^  /, "");
                                selStart = selEnd = start - 2;
                            } else if (value.startsWith("\t", lineStart)) {
                                newText = value.slice(lineStart, start).replace(/^\t/, "");
                                selStart = selEnd = start - 1;
                            } else {
                                newText = value.slice(lineStart, start);
                            }
                            textarea.setRangeText(newText, lineStart, start, "end");
                            return;
                        } else {
                            const insert = "  ";
                            textarea.setRangeText(insert, start, end, "end");
                            return;
                        }
                    }
                    textarea.setRangeText(newText, start, end, "select");
                }
            });

            // 实时更新内容并触发菜单变更事件
            textarea.addEventListener("input", () => {
                if (item.id) {
                    docData.updateContent(item.id, textarea.value);
                    window.dispatchEvent(new Event("menusChanged"));
                }
                contentArea.innerHTML = renderMarkdown(textarea.value || "");
            });
        } else {
            const contentArea = document.createElement("div");
            contentArea.className = "content-area";
            contentArea.innerHTML = renderMarkdown(item.content?.content || "");
            this.container.appendChild(contentArea);
        }
    }

    private findItemByPath(items: MenuItem[], path: string): MenuItem | null {
        for (const item of items) {
            if (item.path === path) return item;
            if (item.children?.length) {
                const result = this.findItemByPath(item.children, path);
                if (result) return result;
            }
        }
        return null;
    }
}
