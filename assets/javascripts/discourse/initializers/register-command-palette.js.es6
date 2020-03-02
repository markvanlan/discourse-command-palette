import showModal from "discourse/lib/show-modal";

export default {
  name: "register-command-palette",

  initialize(container) {
    if (!container.lookup("site-settings:main").command_palette_enabled) {
      return;
    }
    window.addEventListener("keydown", event => {
      if (event.key === "p" && event.ctrlKey) {
        event.preventDefault();
        showModal("command-palette", { title: "command_palette.title" });
      }
    });
  },

  unregister(registration) {}
};
