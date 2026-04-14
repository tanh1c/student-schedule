import toolsCatalogData from "./toolsCatalog.json";
import { defaultToolGradient, toolGradientMap } from "./toolGradientMap";
import { defaultToolIcon, toolIconMap } from "./toolIconMap";

// Add new tools by appending entries to toolsCatalog.json.
// Each entry only needs an `iconKey`; the real icon component is resolved here.
export const toolsCatalog = toolsCatalogData.map((tool) => ({
  ...tool,
  icon: toolIconMap[tool.iconKey] ?? defaultToolIcon,
  gradientStyle: toolGradientMap[tool.id] ?? defaultToolGradient,
}));
