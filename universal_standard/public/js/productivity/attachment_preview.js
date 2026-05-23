(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.attachment_preview = NS.attachment_preview || {});
    const supported = {
        image: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
        text: ["txt", "json", "xml", "csv", "log", "md"],
        pdf: ["pdf"],
    };

    function ext(name) {
        const clean = String(name || "").split("?")[0].split("#")[0];
        return clean.split(".").pop().toLowerCase();
    }

    function typeOf(name) {
        const e = ext(name);
        if (supported.image.includes(e)) return "image";
        if (supported.pdf.includes(e)) return "pdf";
        if (supported.text.includes(e)) return "text";
        return "";
    }

    function safe(value) {
        return frappe.utils.escape_html(value || "");
    }

    function downloadUrl(url) {
        return url.indexOf("?") > -1 ? `${url}&download=1` : `${url}?download=1`;
    }

    function renderUnsupported(area, url, name) {
        area.html(`
            <div class="us-preview-empty">
                <div class="us-preview-empty-title">${__("Preview not available")}</div>
                <div class="text-muted">${__("This file type cannot be previewed here, but you can open it normally.")}</div>
                <button type="button" class="btn btn-primary btn-sm" data-us-open-original>${__("Open Original")}</button>
            </div>
        `);
        area.find("[data-us-open-original]").on("click", () => window.open(url, "_blank"));
    }

    function preview(url, name) {
        const displayName = name || decodeURIComponent(String(url).split("/").pop() || "Attachment");
        const type = typeOf(displayName || url);
        const dialog = new frappe.ui.Dialog({
            title: displayName,
            size: "large",
            fields: [{ fieldtype: "HTML", fieldname: "body" }],
        });
        const area = dialog.fields_dict.body.$wrapper;
        const toolbar = `
            <div class="us-preview-toolbar">
                <div class="us-preview-file-name" title="${safe(displayName)}">${safe(displayName)}</div>
                <div class="us-preview-actions">
                    <button type="button" class="btn btn-sm btn-default" data-us-open-original>${__("Open Original")}</button>
                    <a class="btn btn-sm btn-default" href="${safe(downloadUrl(url))}" download>${__("Download")}</a>
                    <button type="button" class="btn btn-sm btn-primary" data-us-close>${__("Close")}</button>
                </div>
            </div>
            <div class="us-preview-body"></div>
        `;
        area.html(toolbar);
        const body = area.find(".us-preview-body");
        area.find("[data-us-open-original]").on("click", () => window.open(url, "_blank"));
        area.find("[data-us-close]").on("click", () => dialog.hide());

        if (type === "image") body.html(`<div class="us-preview-media-wrap"><img class="us-preview-media" src="${safe(url)}" alt="${safe(displayName)}"></div>`);
        else if (type === "pdf") body.html(`<iframe class="us-preview-frame" src="${safe(url)}"></iframe>`);
        else if (type === "text") {
            body.html(`<div class="us-preview-loading">${__("Loading preview...")}</div>`);
            fetch(url)
                .then((response) => response.text())
                .then((text) => body.html(`<pre class="us-preview-text">${safe(text)}</pre>`))
                .catch(() => renderUnsupported(body, url, displayName));
        } else {
            renderUnsupported(body, url, displayName);
        }
        dialog.show();
        if (dialog.$wrapper) dialog.$wrapper.addClass("us-attachment-preview-dialog");
    }

    function enhance(root) {
        root = root || document;
        root.querySelectorAll(".attachment-row").forEach((row) => {
            if (row.querySelector(".us-preview-attachment")) return;
            const link = row.querySelector('a[href^="/files/"], a[href^="/private/files/"], a[href*="/files/"]');
            if (!link) return;
            const url = link.getAttribute("href");
            const name = (link.getAttribute("title") || link.textContent || url || "").trim();
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "us-preview-attachment";
            btn.setAttribute("aria-label", __("Preview attachment"));
            btn.setAttribute("title", __("Preview"));
            btn.innerHTML = `
                <svg class="us-preview-attachment-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2.25 12s3.5-6.25 9.75-6.25S21.75 12 21.75 12s-3.5 6.25-9.75 6.25S2.25 12 2.25 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
            btn.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                preview(url, name);
            });
            const pill = row.querySelector(".data-pill") || row.querySelector("a") || row.firstElementChild;
            if (pill && pill.parentNode === row) row.insertBefore(btn, pill);
            else row.appendChild(btn);
        });
    }

    mod.init = function () {
        if (mod.initialized) { enhance(); return; }
        mod.initialized = true;
        enhance();
        mod.observer = new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) enhance(node);
        })));
        mod.observer.observe(document.body, { childList: true, subtree: true });
    };

    mod.destroy = function () {
        document.querySelectorAll(".us-preview-attachment").forEach((node) => node.remove());
        if (mod.observer) {
            mod.observer.disconnect();
            mod.observer = null;
        }
        mod.initialized = false;
    };
})();
