frappe.ui.form.on('Universal Standard Settings', {
    refresh(frm) {
        frm.dashboard.clear_headline();
        frm.dashboard.set_headline(__('Changes apply after Save. Use Apply Now to refresh Desk tools immediately.'));

        frm.add_custom_button(__('Apply Now'), () => {
            universal_standard_apply_productivity_settings(frm);
        });
    },

    after_save(frm) {
        universal_standard_apply_productivity_settings(frm);
    },
});

function universal_standard_apply_productivity_settings(frm) {
    frappe.call({
        method: 'universal_standard.api.clear_productivity_settings_cache',
        freeze: false,
        callback() {
            if (
                window.UniversalStandardProductivity &&
                typeof window.UniversalStandardProductivity.init === 'function'
            ) {
                window.UniversalStandardProductivity.init();
            }
            frappe.show_alert({
                message: __('Universal Standard settings applied'),
                indicator: 'green',
            });
        },
        error() {
            frappe.show_alert({
                message: __('Settings saved, but cache refresh failed. Please refresh the page.'),
                indicator: 'orange',
            });
        },
    });
}
