import {
    RouteRecordRaw,
    Router,
    createRouter,
    createWebHistory,
    createWebHashHistory,
  } from "vue-router";
  import routes from "@/router/router.default"

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
  
  export default router;
  