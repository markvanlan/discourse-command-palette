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
  users: {
    name: "Users",
    prefix: "u",
    row: "user-chooser/user-row",
    fetchFunction: _fetchUsers,
    onSelect: _navigateToUser
  },
  reports: {
    name: "Reports",
    prefix: "r",
    row: "command-palette/report-row",
    id: "type",
    fetchFunction: _fetchReports,
    onSelect: _navigateToReport
  },
  siteSettings: {
    name: "Site Settings",
    prefix: "s",
    id: "setting",
    row: "command-palette/site-setting-row",
    fetchFunction: _fetchSiteSettings,
    onSelect: _navigateToSiteSetting
  },
  topics: {
    name: "Topics",
    prefix: "t",
    row: "command-palette/topic-row",
    fetchFunction: _fetchTopics,
    onSelect: _navigateToTopic
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
      return { id: filterable.prefix, name: filterable.name };
    });
  },

  search(filter) {
    if (!filter) {
      this.set("selectKit.options.filterableType", null);
      this.setHeaderText();
      return this.defaultList();
    }

    if (filter) {
      for (const filterableName in FILTERABLES) {
        let filterable = FILTERABLES[filterableName];
        const match = new RegExp(`^${filterable.prefix} (.*)`).exec(filter);

        if (match && match[1] && match[1].length) {
          this.set("selectKit.options.filterableType", filterable);
          this.setHeaderText();
          return filterable.fetchFunction(
            filter.replace(`${filterable.prefix} `, "")
          );
        }
      }

      this.set("selectKit.options.filterableType", null);
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
    if (
      !this.selectKit.options.filterableType ||
      this.selectKit.options.filterableType.prefix !== value
    ) {
      const filterableType = Object.values(FILTERABLES).findBy("prefix", value);
      if (filterableType) {
        this.set("selectKit.options.filterableType", filterableType);
        this.setHeaderText();
      }
      this.set("selectKit.filter", `${value} `);
      this.search(`${value} `);
    } else {
      this.selectKit.options.filterableType.onSelect(
        value,
        item,
        this.transition
      );
    }
  },

  modifyComponentForRow() {
    if (
      this.selectKit.options.filterableType &&
      this.selectKit.options.filterableType.row
    ) {
      return this.selectKit.options.filterableType.row;
    }
  }
});
