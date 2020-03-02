import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { ajax } from "discourse/lib/ajax";
import { schedule } from "@ember/runloop";

export default Controller.extend(ModalFunctionality, {
  onShow() {
    schedule("afterRender", () => {
      document
        .querySelector(".select-kit.command-palette .select-kit-header")
        .click();
    });
  },
  onClose() {
    this.set("term", "");
    this.set("results", []);
  },

  actions: {
    print() {
      this.send("closeModal");
      // I wish this returned a promise :(
      setTimeout(window.print, 100);
    },
    transition(route, args = {}) {
      this.send("closeModal");
      this.transitionToRoute(route, args);
    }
  }
});
