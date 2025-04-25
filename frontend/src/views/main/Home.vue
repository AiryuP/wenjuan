<template>
  <!-- <router-view /> -->

  <div class="wenjuan">

    <div class="header">
      <div class="logo">问卷系统</div>
    </div>
    <div class="bodyer">
      <div class="aside no_scroll">
        <el-menu default-active="0">
          <el-menu-item index="0">
            <!-- <el-icon><i class="el-icon-odometer"></i></el-icon> -->
            仪表盘
          </el-menu-item>
          <el-sub-menu index="1">
            <template #title>
              <!-- <el-icon><i class="el-icon-document"></i></el-icon> -->
              问卷管理
            </template>
            <el-menu-item index="1-1" @click="goPath('/survey/make')">问卷制作</el-menu-item>
            <!-- <el-menu-item index="1-2">问卷管理</el-menu-item> -->
            <el-menu-item index="1-3" @click="goPath('/survey/manage')">
              问卷分类管理
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <!-- <el-icon><i class="el-icon-setting"></i></el-icon> -->
              系统管理
            </template>
            <el-menu-item index="2-1">用户管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <div class="content">
        <!-- 内容区域 -->
        <router-view />
      </div>
    </div>

  </div>


</template>

<script setup lang="ts">

import { ref } from 'vue'
import { useRoute,useRouter } from 'vue-router'
const router = useRouter() 

const goPath = (path: string) => {
  router.push({
    path: path,
  })
}




</script>

<style lang="scss" scoped>
.wenjuan {
  width: 100vw;
  height: 100vh;

  .header {
    width: 100%;
    height: 60px;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    
    .logo {
      font-size: 18px;
      font-weight: bold;
      color: #409eff;
    }
  }

  .bodyer {
    width: 100%;
    height: calc(100% - 60px);
    display: flex; // 添加flex布局
    .aside{
      width: 200px;
      height: 100%;
      overflow: auto;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); // 添加阴影效果
      // border-right: 1px solid #ccc;
      
      // 自定义 Element Plus 菜单样式
      :deep(.el-menu) {
        border-right: none;
        // background-color: #f5f7fa;
      }
      
      :deep(.el-menu-item) {
        height: 50px;
        line-height: 50px;
        color: #606266;
        font-size: 14px;
        transition: all 0.3s; // 添加过渡效果
        
        &:hover {
          background-color: #ecf5ff;
          color: #409eff;
        }
        
        &.is-active {
          color: #409eff;
          background-color: #ecf5ff;
          font-weight: bold;
          border-right: 3px solid #409eff; // 添加活动状态的右侧边框
        }
      }
      
      :deep(.el-sub-menu__title) {
        height: 50px;
        line-height: 50px;
        // color: #303133;
        font-size: 14px;
        // font-weight: bold;
        transition: all 0.3s; // 添加过渡效果
        
        &:hover {
          background-color: #ecf5ff;
          color: #409eff;
        }
      }
      
      :deep(.el-sub-menu) {
        .el-menu-item {
          height: 45px;
          line-height: 45px;
          
          &:hover {
            background-color: #ecf5ff;
          }
        }
      }
      
      // 自定义菜单图标样式
      :deep(.el-icon) {
        margin-right: 6px;
        font-size: 18px;
        vertical-align: middle;
      }
    }
    
    // 添加内容区域样式
    .content {
      flex: 1;
      padding: 15px;
      background-color: #f9f9f9;
      overflow: auto;
    }
  }
}
</style>
