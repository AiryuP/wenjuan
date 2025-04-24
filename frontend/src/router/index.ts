import {
    RouteRecordRaw,
    Router,
    createRouter,
    createWebHistory,
    createWebHashHistory,
  } from "vue-router";
  import routes from "@/router/router.default"
  import { getToken } from "@/utils/auth"

  const autoRouters = () => {
    // @ts-ignore 读取views/page下的所有vue文件,并将其转换为路由
    const pages = import.meta.glob("../views/page/**/*.vue");
    Object.entries(pages).map(([page, component]) => {
      const addr = page.replace("../views/page", "").split("/").filter(Boolean);
      const paths = addr.map((_, index) => `/${addr.slice(0, index + 1).join("/")}`);
      paths.forEach(path => {
        let name = path.slice(path.lastIndexOf("/") + 1).replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
        if (path.endsWith(".vue")) {
          name = name.split(".")[0];
          path = path.split(".")[0].toLowerCase();
        }
        // @ts-ignore 判断routes路由名称是否存在
        if (!routes.at(1).children.find((route: RouteRecordRaw) => route.name === name)) {
          // @ts-ignore
          routes.at(1).children.push({name: name, path:  path, redirect: "", component: component, children: []});
        }
      });
    });
    return routes;
  };

  autoRouters()
 

  const router: Router = createRouter({
    history: createWebHistory(),
    routes: routes
  });
  
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    const token = getToken();
    // 判断该路由是否需要登录权限
    if (to.meta.isLogin) {
      if (token) {
        next();
      } else {
        // 未登录，跳转到登录页面
        next({
          path: '/login',
          query: { redirect: to.fullPath } // 将要跳转的路由path作为参数，登录成功后跳转到该路由
        });
      }
    } else {
      next();
    }
  });
  
  export default router;
  