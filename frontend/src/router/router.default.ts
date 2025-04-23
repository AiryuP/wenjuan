import type { RouteRecordRaw } from "vue-router";
// import 

const routes: Array<RouteRecordRaw> = [
  
  {
    path: "/",
    redirect: "/home",
    meta: { 
      isLogin: false
    },
  },
  {
    path: "/home",
    component: () => import("@/views/main/Home.vue"),
    // redirect: "/page/other",
    meta: { isLogin: false },
    children: [
      
    ]
  },
];

export default routes;
