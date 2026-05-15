(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.attachment_preview = NS.attachment_preview || {});
    const supported = {
        image: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
        text: ["txt", "json", "xml", "csv", "log", "md"],
        pdf: ["pdf"],
    };
    function ext(name) { return (name || "").split(".").pop().toLowerCase(); }
    function typeOf(name) {
        const e = ext(name);
        if (supported.image.includes(e)) return "image";
        if (supported.pdf.includes(e)) return "pdf";
        if (supported.text.includes(e)) return "text";
        return "";
    }
    function preview(url, name) {
        const type = typeOf(name || url);
        if (!type) { window.open(url, "_blank"); return; }
        const dialog = new frappe.ui.Dialog({ title: __("Preview") + ": " + frappe.utils.escape_html(name || ""), size: "extra-large", fields: [{ fieldtype: "HTML", fieldname: "body" }] });
        const area = dialog.fields_dict.body.$wrapper;
        if (type === "image") area.html(`<img class="us-preview-media" src="${frappe.utils.escape_html(url)}">`);
        if (type === "pdf") area.html(`<iframe class="us-preview-frame" src="${frappe.utils.escape_html(url)}"></iframe>`);
        if (type === "text") {
            area.html(`<div class="text-muted">${__("Loading...")}</div>`);
            fetch(url).then(r => r.text()).then(text => area.html(`<pre class="us-preview-text">${frappe.utils.escape_html(text)}</pre>`)).catch(() => window.open(url, "_blank"));
        }
        dialog.show();
    }
    function enhance(root) {
        root = root || document;
        root.querySelectorAll(".attachment-row").forEach(row => {
            if (row.querySelector(".us-preview-attachment")) return;
            const link = row.querySelector("a[href]");
            if (!link) return;
            const url = link.getAttribute("href");
            const name = (link.textContent || url || "").trim();
            if (!typeOf(name || url)) return;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn btn-xs btn-secondary us-preview-attachment";
            btn.textContent = __("Preview");
            btn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); preview(url, name); });
            const target = row.querySelector(".data-pill") || row;
            target.prepend(btn);
        });
    }
    mod.init = function () {
        if (mod.initialized) { enhance(); return; }
        mod.initialized = true;
        enhance();
        const observer = new MutationObserver(m => m.forEach(x => x.addedNodes.forEach(n => { if (n.nodeType === 1) enhance(n); })));
        observer.observe(document.body, { childList: true, subtree: true });
    };
})();
