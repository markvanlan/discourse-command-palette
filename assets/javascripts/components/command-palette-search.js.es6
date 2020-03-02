import ComboBoxComponent from "select-kit/components/combo-box";
import { ajax } from "discourse/lib/ajax";
import AdminUser from "admin/models/admin-user";
import { filterAdminReports } from "admin/controllers/admin-dashboard-reports";

export const _navigateToUser = (value, item, transitionTo) => {
  transitionTo(`/admin/users/${item.id}/${item.username}`);
};

export const _navigateToReport = (value, item, transitionTo) => {
  transitionTo(`/admin/reports/${value}`);
};

export const _navigateToSiteSetting = (value, item, transitionTo) => {
  transitionTo("adminSiteSettings", { queryParams: { filter: value } });
};

export const _fetchUsers = filter => {
  return AdminUser.findAll("active", {
    filter,
    show_emails: false,
    page: 1
  });
};

export const _fetchReports = filter => {
  return ajax("/admin/reports").then(results => {
    return filterAdminReports(results.reports, filter);
  });
};

export const _fetchSiteSettings = filter => {
  return ajax("/admin/site_settings/category/all_results").then(results => {
    return results.site_settings
      .filter(s => s.setting.includes(filter))
      .slice(0, 10);
  });
};

export const FILTERABLES = {
  users: {
    prefix: "u",
    fetchFunction: _fetchUsers,
    row: "user-chooser/user-row",
    onSelect: _navigateToUser
  },
  reports: {
    prefix: "r",
    fetchFunction: _fetchReports,
    row: "command-palette/report-row",
    id: "type",
    onSelect: _navigateToReport
  },
  siteSettings: {
    prefix: "s",
    id: "setting",
    row: "command-palette/site-setting-row",
    fetchFunction: _fetchSiteSettings,
    onSelect: _navigateToSiteSetting
  }
};

export default ComboBoxComponent.extend({
  pluginApiIdentifiers: ["command-palette"],
  classNames: ["command-palette"],
  filterableType: null,

  selectKitOptions: {
    filterable: true
  },

  search(filter) {
    if (!filter) return;

    for (const filterableName in FILTERABLES) {
      let filterable = FILTERABLES[filterableName];
      if (filter.match(new RegExp(`^${filterable.prefix} (.*?)`))) {
        this.set("filterableType", filterable);
        return filterable.fetchFunction(
          filter.replace(`${filterable.prefix} `, "")
        );
      }
    }
  },

  select(value, item) {
    this._super(...arguments);
    this.filterableType.onSelect(value, item, this.transition);
  },

  modifyComponentForRow() {
    if (this.filterableType.row) return this.filterableType.row;
    this._super(...arguments);
  },

  modifyContent(contents) {
    if (this.filterableType && this.filterableType.id) {
      contents.map(row => {
        return Object.assign(row, { id: row[this.filterableType.id] });
      });
    }
    return contents;
  }
});
