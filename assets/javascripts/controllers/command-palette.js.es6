import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { ajax } from "discourse/lib/ajax";
import AdminUser from "admin/models/admin-user";
import discourseComputed from "discourse-common/utils/decorators";
import { filterAdminReports } from "admin/controllers/admin-dashboard-reports";

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
  searchingUsers: false,
  searchingReports: false,
  searchingSiteSettings: false,

  @discourseComputed("term")
  validPrefix(term) {
    return !term || (term && this.prefix);
  },

  @discourseComputed("term")
  prefix(term) {
    return PREFIXES[term.split(" ")[0].toLowerCase()];
  },

  onClose() {
    this.set('term', "")
    this.set('results', [])
  },

  updateSearchType() {
    this.set("searchingUsers", this.prefix === "users");
    this.set("searchingReports", this.prefix === "reports");
    this.set("searchingSiteSettings", this.prefix === "site_settings");
  },

  actions: {
    print() {
      this.send("closeModal");
      // I wish this returned a promise :(
      setTimeout(window.print, 100);
    },

    fetchResults() {
      const queryTerm = this.term.split(" ")[1];
      this.updateSearchType();

      if (this.searchingUsers) {
        AdminUser.findAll("active", {
          filter: queryTerm,
          show_emails: false,
          page: 1
        }).then(results => {
          this.set("results", results);
        });
      } else if (this.searchingReports) {
        ajax("/admin/reports").then(results => {
          this.set("results", filterAdminReports(results.reports, queryTerm));
        });
      } else if (this.searchingSiteSettings) {
        this.transitionToRoute("adminSiteSettings", { queryParams: { filter: queryTerm } })
      }
    }
  }
});
