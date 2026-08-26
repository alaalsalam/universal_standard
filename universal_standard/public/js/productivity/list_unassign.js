(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.list_unassign = NS.list_unassign || {});

    function getListView() {
        return window.cur_list || (frappe && frappe.views && frappe.views.ListView && frappe.views.ListView.current);
    }

    function label() {
        return (frappe.boot && frappe.boot.lang === "ar") ? "إلغاء الإسناد من المحدد" : __("Unassign Selected");
    }

    function addAction() {
        const list = getListView();
        if (!list || !list.page || list.__us_unassign_added) return;
        list.__us_unassign_added = true;
        list.page.add_actions_menu_item(label(), () => {
            const checked = list.get_checked_items ? list.get_checked_items() : [];
            if (!checked.length) {
                frappe.msgprint({
                    title: __("No records selected"),
                    message: __("Select one or more rows, then choose Unassign Selected."),
                    indicator: "orange",
                });
                return;
            }
            frappe.call({
                method: "universal_standard.productivity.list_unassign.unassign_selected",
                args: { doctype: list.doctype, names: checked.map((item) => item.name) },
                freeze: true,
                freeze_message: __("Removing assignments..."),
                callback: (response) => {
                    const result = response.message || {};
                    const removed = result.removed || 0;
                    const records = result.records || checked.length;
                    frappe.show_alert({
                        message: __(`Assignments removed from ${removed} task(s) across ${records} record(s).`),
                        indicator: removed ? "green" : "orange",
                    });
                    list.refresh();
                },
                error: () => {
                    frappe.msgprint({
                        title: __("Unassign Selected"),
                        message: __("Could not remove assignments. Please check your permissions and try again."),
                        indicator: "red",
                    });
                },
            });
        });
    }

    mod.init = function () {
        addAction();
        if (!mod.bound) {
            mod.bound = true;
            $(document).on("page-change.us_list_unassign toolbar_setup.us_list_unassign", () => setTimeout(addAction, 300));
        }
    };

    mod.destroy = function () {
        if (mod.bound) {
            $(document).off(".us_list_unassign");
            mod.bound = false;
        }
    };
})();
