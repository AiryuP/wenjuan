<template>
  <div class="login-container">
    <div class="login-box">
      <h2>问卷调查系统</h2>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"  >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password>
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input v-model="loginForm.captcha" placeholder="请输入验证码" class="captcha-input">
              <template #prefix>
                <el-icon><Picture /></el-icon>
              </template>
            </el-input>
            <div class="captcha-image" @click="refreshCaptcha" title="点击刷新验证码">
              <img :src="captchaUrl" alt="验证码" />
              <!-- <div class="captcha-refresh-tip">点击刷新</div> -->
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { User, Lock, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElLoading } from 'element-plus'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)
const captchaUrl = ref('')

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '请输入正确的验证码', trigger: 'blur' }
  ]
}

// 获取验证码
const refreshCaptcha = () => {
  // 这里使用时间戳作为参数，确保每次请求都是新的验证码
  captchaUrl.value = `/api/login/captcha?t=${new Date().getTime()}`
  // 清空验证码输入框
  loginForm.captcha = ''
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true
        // 显示全屏加载
        const loadingInstance = ElLoading.service({
          lock: true,
          text: '登录中...',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        
        // 调用登录接口
        const response = await axios.post('http://localhost:4124/api/login/login', {
          username: loginForm.username,
          password: loginForm.password,
          captcha: loginForm.captcha
        })
        
        if (response.data.code === 200) {
          ElMessage.success('登录成功')
          // 存储token和用户信息
          localStorage.setItem('token', response.data.data.token)
          localStorage.setItem('userInfo', JSON.stringify(response.data.data.user))
          // 跳转到首页
          router.push('/home')
        } else {
          ElMessage.error(response.data.message || '登录失败')
          // 刷新验证码
          refreshCaptcha()
        }
      } catch (error: any) {
        console.error('登录错误:', error)
        ElMessage.error(error.response?.data?.message || '登录失败，请稍后重试')
        // 刷新验证码
        refreshCaptcha()
      } finally {
        loading.value = false
        // 关闭全屏加载
        ElLoading.service().close()
      }
    } else {
      ElMessage.warning('请正确填写登录信息')
      return false
    }
  })
}

onMounted(() => {
  // 页面加载时获取验证码
  refreshCaptcha()
})
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    top: -150px;
    right: -150px;
    z-index: 0;
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.3);
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.493);
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  
  @media (max-width: 480px) {
    width: 90%;
    padding: 30px 20px;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 10px;
    color: #333;
    font-weight: 600;
  }
  
  .login-subtitle {
    text-align: center;
    margin-bottom: 25px;
    color: #666;
    font-size: 14px;
  }
  
  .login-tips {
    margin-top: 15px;
    text-align: center;
    color: #999;
    font-size: 12px;
  }
  
  .login-button {
    width: 100%;
    padding: 12px 0;
    font-size: 16px;
  }
}

.captcha-container {
  display: flex;
  align-items: center;
  
  .captcha-input {
    flex: 1;
  }
  
  .captcha-image {
    margin-left: 10px;
    height: 40px;
    width: 120px;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      
      .captcha-refresh-tip {
        opacity: 1;
      }
    }
    
    .captcha-refresh-tip {
      
      width: 100%;
      height: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      font-size: 12px;
      text-align: center;
      padding: 2px 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
