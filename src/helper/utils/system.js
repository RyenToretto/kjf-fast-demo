/** @format */

const prompt = require('@system.prompt')
const router = require('@system.router')
const share = require('@service.share')

/**
 * @desc 创建桌面图标
 * 注意：使用加载器测试`创建桌面快捷方式`功能时，请先在`系统设置`中打开`应用加载器`的`桌面快捷方式`权限
 */
function createShortcut() {
  const shortcut = require('@system.shortcut')
  shortcut.hasInstalled({
    success: function(ret) {
      if (ret) {
        prompt.showToast({
          message: '已创建桌面图标'
        })
      } else {
        shortcut.install({
          success: function() {
            prompt.showToast({
              message: '成功创建桌面图标'
            })
          },
          fail: function(errmsg, errcode) {
            prompt.showToast({
              message: `${errcode}: ${errmsg}`
            })
          }
        })
      }
    }
  })
}

/**
 * @desc 调起第三方分享
 */
function call3thPartyShare(title, desc, targetUrl, imagePath = '/assets/images/logo.png') {
  share.share({
    shareType: 0,
    title,
    summary: desc,
    imagePath,
    targetUrl,
    platforms: ['SYSTEM'],
    success: function(data) {
      prompt.showToast({
        message: `分享成功`
      })
      console.log(`handling success, data = ${JSON.stringify(data, null, 4)}`)
    },
    fail: function(data, code) {
      prompt.showToast({
        message: `handling fail, code = ${code}, message: ${JSON.stringify(data, null, 4)}`
      })
      console.log(`handling fail, code = ${code}`)
    }
  })
}

export default {
  createShortcut,

  showToast(message = '', duration = 0) {
    if (!message) return
    prompt.showToast({
      message: message,
      duration
    })
  },

  route2theUrl(url, params) {
    router.push({
      uri: url,
      params: params
    })
  },

  call3thPartyShare
}
