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
    meta: { isLogin: true }, // 设置为需要登录才能访问
    children: [
      
    ]
  },
  
  {
    path: "/login",
    component: () => import("@/views/main/Login.vue"),
    meta: { 
      isLogin: false
    },
  },
];

export default routes;
