import shortcut from '@system.shortcut';
import prompt from "@system.prompt";

const create = async (showErr = false) => {
  return new Promise((resolve) => {
    try {
      shortcut.install({
        message: '添加“快看浏览器”到桌面，下次可直接在桌面打开快看浏览器',
        success: (ret) => {
          resolve(true);
        },
        fail: (erromsg, errocode) => {
          console.log('errocode = ', errocode);
          if (errocode === 201) {
            resolve(false);
          } else {
            showErr && prompt.showToast({
              message: `创建桌面图标失败(${errocode})`,
              duration: 2000,
              gravity: "center"
            });
            resolve(false);
          }
        }
      });
    } catch (e) {
      showErr && prompt.showToast({
        message: '创建桌面图标失败: 未获取到相关权限',
        duration: 2000,
        gravity: "center"
      });
      resolve(false);
    }
  });
};

const hasCreated = async (showErr = false, createIfNot = false) => {
  return new Promise((resolve) => {
    try {
      shortcut.hasInstalled({
        success: async (isCreated) => {
          let createSuccess = false;
          let shouldExitApp = false;
          if (!isCreated && createIfNot) {
            createSuccess = await create(showErr);
            shouldExitApp = true;
          }
          resolve({ isCreated, createSuccess, shouldExitApp });
        },
        fail: (erromsg, errocode) => {
          showErr && prompt.showToast({
            message: `(${errocode})当前设备获取图标信息异常: ${erromsg}`,
            duration: 2000,
            gravity: "center"
          });
          resolve({ isCreated: true });
        },
        complete: () => {
        }
      })
    } catch (e) {
      showErr && prompt.showToast({
        message: `当前设备获取图标信息异常`,
        duration: 2000,
        gravity: "center"
      });
      console.log(`当前设备获取图标信息异常, err = ${e}`);
      resolve({ isCreated: true });
    }
  });
};

const deskIcon = {
  hasCreated,
  create
};

export default deskIcon;
