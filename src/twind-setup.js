import { LitElement } from "lit";
import { defineConfig, install, tw } from "@twind/core";
import installWebComponent from "@twind/with-web-components";
import presetTailwind from "@twind/preset-tailwind";
import presetTailwindForms from "@twind/preset-tailwind-forms";
import presetAutoprefix from "@twind/preset-autoprefix";

const config = defineConfig({
  presets: [presetTailwind(), presetAutoprefix(), presetTailwindForms()],
});

const withTwind = installWebComponent(config);

const LitWithTwindElement = withTwind(LitElement);

function applyTwind() {
  install(config);
}

export { LitWithTwindElement, applyTwind, tw };
