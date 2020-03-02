import SelectKitRowComponent from "select-kit/components/select-kit/select-kit-row";
import { computed } from "@ember/object";

export default SelectKitRowComponent.extend({
  layoutName:
    "select-kit/templates/components/command-palette/site-setting-row",
  classNames: ["site-setting-row"],

  name: computed("item", function() {
    return this.item.setting.replace(/_/g, " ");
  })
});
