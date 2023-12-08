let sidebarWidth = 230;
let draggableWidth = 6;
let windowWidth = 0;
let windowHeight = 0;
const filledLeftSidebar = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-layout-sidebar-inset" viewBox="0 0 16 16">
<path d="M14 2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12zM2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2z"/>
<path d="M3 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"/>
</svg>`;
const unfilledLeftSidebar = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
class="bi bi-layout-sidebar" viewBox="0 0 16 16">
<path
    d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm5-1v12h9a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H5zM4 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2V2z" />
</svg>`;
const filledRightSidebar = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-layout-sidebar-inset-reverse" viewBox="0 0 16 16">
<path d="M2 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h12z"/>
<path d="M13 4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4z"/>
</svg>`;
const unfilledRightSidebar = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
class="bi bi-layout-sidebar-reverse" viewBox="0 0 16 16">
<path
    d="M16 3a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3zm-5-1v12H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h9zm1 0h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2V2z" />
</svg>`;
function resizable(element, draggable, toggle, css_var, right = false, width = 230) {
    let prevWidth = width;
    document.documentElement.style.setProperty(css_var, `${width}px`);
    document.documentElement.style.setProperty("--draggable-width", `${draggableWidth}px`);
    toggle.addEventListener("click", function () {
        element.classList.toggle("collapsed");
        if (element.classList.contains("collapsed")) {
            prevWidth = width;
            width = draggableWidth;
            toggle.innerHTML = right ? filledRightSidebar : filledLeftSidebar;
            document.documentElement.style.setProperty(css_var, `${width}px`);
        } else {
            width = Math.min(Math.max(prevWidth, 100), windowWidth);
            document.documentElement.style.setProperty(css_var, `${width}px`);
            toggle.innerHTML = right ? unfilledRightSidebar : unfilledLeftSidebar;
        }
    });
    let dragging = false;
    draggable.addEventListener("mousedown", function () {
        dragging = true;
        draggable.classList.add('dragging');
        element.classList.add('resizing');
    });
    document.addEventListener("mouseup", function () {
        dragging = false;
        draggable.classList.remove('dragging');
        element.classList.remove('resizing');
    });
    document.addEventListener("mousemove", function (event) {
        if (!dragging)
            return;
        width = Math.min(right ? windowWidth - event.clientX : event.clientX, windowWidth);
        if (width <= 35) {
            element.classList.add("collapsed");
            prevWidth = width;
            width = draggableWidth;
            document.documentElement.style.setProperty(css_var, `${width}px`);
            toggle.innerHTML = right ? filledRightSidebar : filledLeftSidebar;
        } else {
            if (element.classList.contains("collapsed")) {
                element.classList.remove("collapsed");
                toggle.innerHTML = right ? unfilledRightSidebar : unfilledLeftSidebar;
            }
            document.documentElement.style.setProperty(css_var, `${width}px`);
        }
    });
    function updateSizes() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        console.log('Update sizes!', windowWidth, windowWidth < 500);
        if (windowWidth < 500) {
            element.classList.add("collapsed");
            prevWidth = width;
            width = draggableWidth;
            document.documentElement.style.setProperty(css_var, `${width}px`);
            toggle.innerHTML = right ? filledRightSidebar : filledLeftSidebar;
        }
        setTimeout(function () {
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
            console.log('Update sizes!', windowWidth, windowWidth < 500);
            if (windowWidth < 500) {
                element.classList.add("collapsed");
                prevWidth = width;
                width = draggableWidth;
                document.documentElement.style.setProperty(css_var, `${width}px`);
                toggle.innerHTML = right ? filledRightSidebar : filledLeftSidebar;
            }
        }, 500)
    }
    window.addEventListener("resize", updateSizes);
    updateSizes();
}
window.addEventListener("load", function () {
    adjustSize();
    const sidebar = document.getElementById("sidebar");
    const topbar = document.getElementById("topbar");
    const messages = document.getElementById("messages");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const textarea = document.getElementById("input");
    const sidebarDraggable = document.querySelector("#sidebar .draggable");
    const chatMenu = document.getElementById("chat-menu");
    const chatMenuDraggable = document.querySelector("#chat-menu .draggable");
    const chatMenuToggle = document.getElementById("chat-menu-toggle");
    resizable(sidebar, sidebarDraggable, sidebarToggle, "--sidebar-width", false, sidebarWidth);
    resizable(chatMenu, chatMenuDraggable, chatMenuToggle, "--chat-menu-width", true, 230);
    const messageList = document.getElementById("message-list");
    const sendButton = document.getElementById("send");
    let currentLines = 0;
    textarea.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            return sendButton.click();
        }
        let lines = textarea.value.split("\n").length;
        if (event.key === "Enter") {
            lines = lines + 1;
        }
        let scroll = false;
        if (messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 5) {
            scroll = true;
        }
        document.documentElement.style.setProperty('--input-height', `${lines}rem`);
        if (scroll)
            setTimeout(() => messageList.scrollTo(0, messageList.scrollHeight), 35);
    });
    sendButton.addEventListener("click", function () {
        sendMessage(textarea.value, currentChat);
        let scroll = false;
        if (messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 5) {
            scroll = true;
        }
        // let messageElement = renderMessage({
        //     content: textarea.value,
        //     sender: user,
        //     timestamp: new Date(),
        //     index: currentChat.messages.length,
        //     encrypted
        // })
        // messageList.appendChild(messageElement);
        textarea.value = '';
        if (scroll)
            messageList.scrollTo(0, messageList.scrollHeight);
    })
    setInterval(function () {
        let lines = textarea.value.split("\n").length;
        if (lines === currentLines) return;
        currentLines = lines;
        let scroll = false;
        if (messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 5) {
            scroll = true;
        }
        document.documentElement.style.setProperty('--input-height', `${lines}rem`);
        if (scroll)
            messageList.scrollTo(0, messageList.scrollHeight);
    }, 75)
});

function adjustSize() {
    // Update sizes
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
}
window.addEventListener("resize", adjustSize);