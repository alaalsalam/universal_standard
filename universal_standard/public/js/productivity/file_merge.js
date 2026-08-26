(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const MODULE = (NS.file_merge = NS.file_merge || {});
    const BUTTON_CLASS = "us-file-merge-button";

    function __(text, args) {
        return window.__ ? window.__(text, args) : text;
    }

    function escapeHtml(value) {
        const text = value == null ? "" : String(value);
        if (window.frappe && frappe.utils && frappe.utils.escape_html) {
            return frappe.utils.escape_html(text);
        }
        return text.replace(/[&<>"']/g, function (char) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
        });
    }

    function fileSize(bytes) {
        if (!bytes) return "0 KB";
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unit = 0;
        while (size >= 1024 && unit < units.length - 1) {
            size = size / 1024;
            unit += 1;
        }
        return (unit ? size.toFixed(1) : size.toFixed(0)) + " " + units[unit];
    }

    function readAsDataUrl(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () {
                resolve({
                    name: file.name,
                    type: file.type || "",
                    size: file.size || 0,
                    data: reader.result,
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function safeRefreshForm(uploader) {
        const frm = uploader && uploader.frm ? uploader.frm : window.cur_frm;
        if (frm && typeof frm.reload_doc === "function") {
            frm.reload_doc();
        }
        if (window.jQuery) {
            jQuery(document).trigger("attachment_uploaded");
        }
    }

    function getUploaderContext(uploader) {
        const frm = uploader && uploader.frm ? uploader.frm : null;
        return {
            doctype: (uploader && (uploader.doctype || uploader.dt)) || (frm && frm.doctype) || null,
            docname: (uploader && (uploader.docname || uploader.dn)) || (frm && frm.docname) || null,
            fieldname: (uploader && (uploader.fieldname || uploader.df)) || null,
            folder: (uploader && uploader.folder) || "Home",
            isPrivate: uploader && uploader.make_attachments_public ? 0 : 1,
        };
    }

    function makeDialog(uploader) {
        const state = { files: [] };
        const context = getUploaderContext(uploader);
        const dialog = new frappe.ui.Dialog({
            title: __("Merge Files"),
            size: "large",
            fields: [
                {
                    fieldtype: "HTML",
                    fieldname: "merge_html",
                    options: [
                        '<div class="us-file-merge-panel">',
                        '  <div class="us-file-merge-drop">',
                        '    <div class="us-file-merge-drop-title">' + escapeHtml(__("Select PDFs or images to merge")) + '</div>',
                        '    <div class="us-file-merge-drop-help">' + escapeHtml(__("Files are merged in the order shown below and saved as one PDF attachment.")) + '</div>',
                        '    <input class="us-file-merge-input" type="file" multiple accept="application/pdf,image/*,.pdf,.png,.jpg,.jpeg,.webp,.tif,.tiff">',
                        '  </div>',
                        '  <div class="us-file-merge-options">',
                        '    <label class="control-label">' + escapeHtml(__("Output File Name")) + '</label>',
                        '    <input class="form-control us-file-merge-filename" type="text" value="merged-file.pdf">',
                        '    <label class="us-file-merge-private"><input type="checkbox" class="us-file-merge-is-private"> ' + escapeHtml(__("Private attachment")) + '</label>',
                        '  </div>',
                        '  <div class="us-file-merge-list"></div>',
                        '</div>',
                    ].join(""),
                },
            ],
            primary_action_label: __("Merge and Attach"),
            primary_action: function () {
                mergeAndAttach(dialog, uploader, state);
            },
        });

        dialog.show();
        dialog.$wrapper.find(".us-file-merge-is-private").prop("checked", Boolean(context.isPrivate));
        dialog.$wrapper.find(".us-file-merge-input").on("change", function (event) {
            const selected = Array.prototype.slice.call(event.target.files || []);
            if (!selected.length) return;
            Promise.all(selected.map(readAsDataUrl))
                .then(function (rows) {
                    state.files = state.files.concat(rows);
                    renderFileList(dialog, state);
                    event.target.value = "";
                })
                .catch(function () {
                    frappe.msgprint({ title: __("File Merge"), message: __("Could not read one of the selected files."), indicator: "red" });
                });
        });
        renderFileList(dialog, state);
        return dialog;
    }

    function renderFileList(dialog, state) {
        const list = dialog.$wrapper.find(".us-file-merge-list");
        if (!state.files.length) {
            list.html('<div class="us-file-merge-empty">' + escapeHtml(__("No files selected yet.")) + '</div>');
            return;
        }
        list.html(
            state.files
                .map(function (file, index) {
                    return [
                        '<div class="us-file-merge-row" data-index="' + index + '">',
                        '  <div class="us-file-merge-index">' + (index + 1) + '</div>',
                        '  <div class="us-file-merge-meta">',
                        '    <div class="us-file-merge-name">' + escapeHtml(file.name) + '</div>',
                        '    <div class="us-file-merge-subtitle">' + escapeHtml(file.type || __("Unknown type")) + ' - ' + escapeHtml(fileSize(file.size)) + '</div>',
                        '  </div>',
                        '  <div class="us-file-merge-actions">',
                        '    <button type="button" class="btn btn-xs btn-default" data-action="up" ' + (index === 0 ? "disabled" : "") + '>↑</button>',
                        '    <button type="button" class="btn btn-xs btn-default" data-action="down" ' + (index === state.files.length - 1 ? "disabled" : "") + '>↓</button>',
                        '    <button type="button" class="btn btn-xs btn-default text-danger" data-action="remove">' + escapeHtml(__("Remove")) + '</button>',
                        '  </div>',
                        '</div>',
                    ].join("");
                })
                .join("")
        );
        list.find("button[data-action]").on("click", function () {
            const row = jQuery(this).closest(".us-file-merge-row");
            const index = Number(row.data("index"));
            const action = jQuery(this).data("action");
            if (action === "remove") state.files.splice(index, 1);
            if (action === "up" && index > 0) {
                const temp = state.files[index - 1];
                state.files[index - 1] = state.files[index];
                state.files[index] = temp;
            }
            if (action === "down" && index < state.files.length - 1) {
                const temp = state.files[index + 1];
                state.files[index + 1] = state.files[index];
                state.files[index] = temp;
            }
            renderFileList(dialog, state);
        });
    }

    function mergeAndAttach(dialog, uploader, state) {
        if (!state.files.length) {
            frappe.msgprint({ title: __("File Merge"), message: __("Select at least one file to merge."), indicator: "orange" });
            return;
        }
        const context = getUploaderContext(uploader);
        const filename = dialog.$wrapper.find(".us-file-merge-filename").val() || "merged-file.pdf";
        const isPrivate = dialog.$wrapper.find(".us-file-merge-is-private").is(":checked") ? 1 : 0;
        dialog.set_primary_action(__("Merging..."), function () {});
        frappe.call({
            method: "universal_standard.productivity.file_merge.merge_and_upload",
            args: {
                files: JSON.stringify(state.files),
                filename: filename,
                doctype: context.doctype,
                docname: context.docname,
                fieldname: context.fieldname,
                folder: context.folder,
                is_private: isPrivate,
            },
            freeze: true,
            freeze_message: __("Merging files..."),
        }).then(function (response) {
            const fileDoc = response.message || {};
            frappe.show_alert({ message: __("Merged file attached: {0}", [fileDoc.file_name || filename]), indicator: "green" });
            dialog.hide();
            if (uploader && uploader.dialog) uploader.dialog.hide();
            safeRefreshForm(uploader);
        }).catch(function () {
            dialog.set_primary_action(__("Merge and Attach"), function () {
                mergeAndAttach(dialog, uploader, state);
            });
        });
    }

    function injectButton(uploader) {
        if (!uploader || !uploader.dialog || !uploader.dialog.$wrapper) return;
        const wrapper = uploader.dialog.$wrapper;
        if (wrapper.find("." + BUTTON_CLASS).length) return;
        const button = jQuery('<button type="button" class="btn btn-sm btn-default ' + BUTTON_CLASS + '"><span class="us-file-merge-icon">⇄</span> ' + escapeHtml(__("Merge Files")) + '</button>');
        button.on("click", function () {
            makeDialog(uploader);
        });
        const uploadActions = wrapper.find(".file-upload-area .mt-3.text-center, .file-upload-area .text-center").first();
        if (uploadActions.length) {
            uploadActions.append(button);
        } else {
            wrapper.find(".modal-footer").prepend(button);
        }
    }

    function patchUploader(settings) {
        if (!window.frappe || !frappe.ui || !frappe.ui.FileUploader) return false;
        const proto = frappe.ui.FileUploader.prototype;
        if (!MODULE.originalMakeDialog) MODULE.originalMakeDialog = proto.make_dialog;
        if (proto.make_dialog && proto.make_dialog.__us_file_merge_patched) return true;
        const original = MODULE.originalMakeDialog;
        proto.make_dialog = function () {
            const result = original.apply(this, arguments);
            const uploader = this;
            setTimeout(function () {
                injectButton(uploader);
            }, 120);
            return result;
        };
        proto.make_dialog.__us_file_merge_patched = true;
        return true;
    }

    MODULE.init = function (settings) {
        MODULE.settings = settings || {};
        if (MODULE.retryTimer) clearTimeout(MODULE.retryTimer);
        if (!patchUploader(settings)) {
            MODULE.retryTimer = setTimeout(function () {
                MODULE.init(settings);
            }, 700);
        }
    };

    MODULE.destroy = function () {
        if (MODULE.retryTimer) clearTimeout(MODULE.retryTimer);
        if (window.frappe && frappe.ui && frappe.ui.FileUploader && MODULE.originalMakeDialog) {
            frappe.ui.FileUploader.prototype.make_dialog = MODULE.originalMakeDialog;
        }
        jQuery("." + BUTTON_CLASS).remove();
    };
})();
