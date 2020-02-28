import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { ajax } from "discourse/lib/ajax";
import AdminUser from "admin/models/admin-user";
import discourseComputed from "discourse-common/utils/decorators";

export const PREFIXES = {
  u: "users",
  users: "users",
  r: "reports",
  reports: "reports",
  s: "site_settings",
  site_settings: "site_settings"
};

export default Controller.extend(ModalFunctionality, {
  term: null,
  results: null,

  @discourseComputed("term")
  validPrefix(term) {
    return !term || (term && this.prefix);
  },

  @discourseComputed("term")
  prefix(term) {
    return PREFIXES[term.split(" ")[0].toLowerCase()];
  },

  @discourseComputed("term")
  queryTerm(term) {
    return term.split(" ")[1];
  },

  @discourseComputed("term")
  searchingUsers(term) {
    return !term || this.prefix === "users";
  },

  actions: {
    print() {
      this.send("closeModal");
      // I wish this returned a promise :(
      setTimeout(window.print, 100);
    },

    fetchResults() {
      if (this.searchingUsers) {
        AdminUser.findAll("active", {
          filter: this.queryTerm,
          show_emails: false,
          page: 1
        }).then(results => {
          this.set("results", results);
        });
      }
    }
  }
});
