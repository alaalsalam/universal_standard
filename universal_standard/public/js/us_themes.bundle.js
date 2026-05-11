(() => {
  // ../themes/themes/public/js/theme_switcher.js
  frappe.provide("frappe.ui");
  frappe.ui.ThemeSwitcher = class CustomThemeSwitcher extends frappe.ui.ThemeSwitcher {
    fetch_themes() {
      return new Promise((resolve) => {
        this.themes = [
          {
            name: "light",
            label: "Frappe Light",
            info: "Light Theme"
          },
          {
            name: "dark",
            label: "Timeless Night",
            info: "Dark Theme"
          },
          {
            name: "automatic",
            label: "Automatic",
            info: "Uses system's theme to switch between light and dark mode"
          },
          {
            name: "purple",
            label: "Purple",
            info: "Purple Theme"
          },
          {
            name: "green",
            label: "Green",
            info: "Green Theme"
          },
          {
            name: "blue",
            label: "Blue",
            info: "Blue Theme"
          },
          {
            name: "dark-blue",
            label: "Dark-blue",
            info: "Dark-blue Theme"
          }
        ];
        resolve(this.themes);
      });
    }
  };
})();
//# sourceMappingURL=themes.bundle.HMVZBJ7V.js.map
