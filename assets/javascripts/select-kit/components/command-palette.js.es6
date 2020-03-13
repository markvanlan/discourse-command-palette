import ComboBoxComponent from "select-kit/components/combo-box";
import discourseComputed from "discourse-common/utils/decorators";
import { ajax } from "discourse/lib/ajax";
import AdminUser from "admin/models/admin-user";
import { isNone } from "@ember/utils";
import { computed, action } from "@ember/object";
import { filterAdminReports } from "admin/controllers/admin-dashboard-reports";
import { searchForTerm } from "discourse/lib/search";

export const _navigateToUser = (value, item, transitionTo) => {
  transitionTo(`/admin/users/${item.id}/${item.username}`);
};

export const _navigateToReport = (value, item, transitionTo) => {
  transitionTo(`/admin/reports/${value}`);
};

export const _navigateToSiteSetting = (value, item, transitionTo) => {
  transitionTo("adminSiteSettings", { queryParams: { filter: value } });
};

export const _navigateToTopic = (value, item, transitionTo) => {
  transitionTo("topic", item.topic);
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
    return results.reports
      .filter(r => r.title.toLowerCase().includes(filter))
      .slice(0, 10);
  });
};

export const _fetchSiteSettings = filter => {
  return ajax("/admin/site_settings/category/all_results").then(results => {
    return results.site_settings
      .filter(s => s.setting.replace(/_/g, " ").includes(filter))
      .slice(0, 10);
  });
};

export const _fetchTopics = filter => {
  if (!filter) return;

  return searchForTerm(filter, { typeFilter: "topic" }).then(results => {
    return results.posts.slice(0, 10);
  });
};

export const FILTERABLES = {
  topics: {
    name: "Topics",
    prefix: "t",
    row: "command-palette/topic-row",
    fetchFunction: _fetchTopics,
    onSelect: _navigateToTopic
  },
  users: {
    name: "Users",
    prefix: "u",
    row: "user-chooser/user-row",
    fetchFunction: _fetchUsers,
    onSelect: _navigateToUser
  },
  siteSettings: {
    name: "Site Settings",
    prefix: "s",
    id: "setting",
    row: "command-palette/site-setting-row",
    fetchFunction: _fetchSiteSettings,
    onSelect: _navigateToSiteSetting
  },
  reports: {
    name: "Reports",
    prefix: "r",
    row: "command-palette/report-row",
    id: "type",
    fetchFunction: _fetchReports,
    onSelect: _navigateToReport
  }
};

export default ComboBoxComponent.extend({
  pluginApiIdentifiers: ["command-palette"],
  classNames: ["command-palette"],

  selectKitOptions: {
    filterable: true,
    filterableType: null,
    closeOnChange: false
  },

  defaultList() {
    return Object.keys(FILTERABLES).map(filterableName => {
      const filterable = FILTERABLES[filterableName];
      return {
        id: filterable.prefix,
        name: filterable.name
      };
    });
  },

  search(filter) {
    if (filter) {
      const filterableType = Object.values(FILTERABLES).find(f => {
        return new RegExp(`^${f.prefix} (.*)`).exec(filter);
      });

      if (filterableType) {
        this.set("selectKit.options.filterableType", filterableType);
        this.setHeaderText();
        return filterableType.fetchFunction(
          filter.replace(`${filterableType.prefix} `, "")
        );
      }
    } else {
      this.set("selectKit.options.filterableType", null);
      this.setHeaderText();
      return this.defaultList();
    }
  },

  setHeaderText() {
    const name = this.getHeader().querySelector("span.name");
    name.innerHTML = "";
    let text =
      this.selectKit.options.filterableType &&
      this.selectKit.options.filterableType.name
        ? this.selectKit.options.filterableType.name
        : I18n.t("command_palette.no_filter");
    name.appendChild(document.createTextNode(text));
  },

  @action
  onChange(value, item) {
    if (!this.selectKit.options.filterableType) {
      const filterableType = Object.values(FILTERABLES).findBy("prefix", value);
      if (filterableType) {
        this.set("selectKit.options.filterableType", filterableType);
        this.setHeaderText();
      }
      this.set("selectKit.filter", `${value} `);
      this.triggerSearch(`${value} `);
    } else {
      this.selectKit.options.filterableType.onSelect(
        value,
        item,
        this.transition
      );
    }
  },

  modifyComponentForRow() {
    return (
      this.selectKit.options.get("filterableType.row") ||
      this._super(...arguments)
    );
  }
});
