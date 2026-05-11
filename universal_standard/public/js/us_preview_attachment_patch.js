(function () {
	function installPatch() {
		const Attachments = frappe && frappe.ui && frappe.ui.form && frappe.ui.form.Attachments;
		if (!Attachments || !Attachments.prototype || Attachments.prototype.__us_preview_patch_installed) {
			return;
		}

		Attachments.prototype.__us_preview_patch_installed = true;

		function refreshPreviewButtons(ctx) {
			const root = (ctx && ctx.parent) || (ctx && ctx.wrapper) || $(document.body);
			const rows = root.find('.attachment-row');

			rows.each(function () {
				const row = $(this);
				if (row.find('.us-preview-btn').length) return;

				const link = row.find('a[href]').first();
				if (!link.length) return;

				const fileUrl = String(link.attr('href') || '').trim();
				if (!fileUrl) return;

				const fileName = String(link.text() || row.attr('data-file-name') || 'Attachment').trim();
				const button = $(
					`<button type="button" class="btn btn-xs btn-secondary us-preview-btn" title="Preview ${frappe.utils.escape_html(fileName)}" style="margin-inline-end: 6px;">` +
						'<i class="octicon octicon-eye"></i>' +
					'</button>'
				);

				button.on('click', function (event) {
					event.preventDefault();
					event.stopPropagation();

					if (ctx && typeof ctx.preview_attachment === 'function') {
						ctx.preview_attachment(fileUrl, fileName);
						return;
					}

					window.open(fileUrl, '_blank', 'noopener');
				});

				const target = row.find('.data-pill, .attachment-content, .attachment-actions').first();
				if (target.length) {
					target.prepend(button);
				} else {
					row.prepend(button);
				}
			});
		}

		const oldMake = Attachments.prototype.make;
		Attachments.prototype.make = function () {
			const result = oldMake ? oldMake.apply(this, arguments) : undefined;
			refreshPreviewButtons(this);

			if (!this.__us_preview_observer && window.MutationObserver) {
				const node = (this.parent && this.parent[0]) || (this.wrapper && this.wrapper[0]);
				if (node) {
					this.__us_preview_observer = new MutationObserver(() => refreshPreviewButtons(this));
					this.__us_preview_observer.observe(node, { childList: true, subtree: true });
				}
			}

			return result;
		};

		const oldAddAttachment = Attachments.prototype.add_attachment;
		Attachments.prototype.add_attachment = function () {
			const result = oldAddAttachment ? oldAddAttachment.apply(this, arguments) : undefined;
			refreshPreviewButtons(this);
			return result;
		};
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', installPatch);
	} else {
		installPatch();
	}
})();
