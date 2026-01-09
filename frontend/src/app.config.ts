export default defineAppConfig({
  pages: [
    "pages/fridge/index",
    "pages/recipes/index",
    "pages/settings/index",
    "pages/chat/index",
    "pages/editItem/index",
    "pages/editRecipe/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "ZenHome",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#999",
    selectedColor: "#6366f1",
    backgroundColor: "#fff",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/fridge/index",
        text: "冰箱",
        iconPath: "assets/icons/fridge.png",
        selectedIconPath: "assets/icons/fridge-active.png",
      },
      {
        pagePath: "pages/recipes/index",
        text: "食谱",
        iconPath: "assets/icons/recipe.png",
        selectedIconPath: "assets/icons/recipe-active.png",
      },
      {
        pagePath: "pages/settings/index",
        text: "设置",
        iconPath: "assets/icons/settings.png",
        selectedIconPath: "assets/icons/settings-active.png",
      },
    ],
  },
});
