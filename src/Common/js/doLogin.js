import account from '@service.account';

import { appid } from './static.js';
import http from './http.js';
import rootStore from './rootStore.js';
import PubSub from './pubSub.js';

let requesting = false;

const getCode = () => {
  return new Promise((resolve) => {
    const provider = account.getProvider();
    console.log(`\n\n**** 设备 = ${provider} ****`);
    account.authorize({
      appid: appid[provider], // TODO 沙盒/线上
      type: "token",
      state: "feedbeef",
      scope: "scope.baseProfile",
      forceLogin: 0, // 未登录华为帐号或者鉴权失败时，不主动拉起帐号登录页面
      success: async (data) => {
        if (data) {
          resolve({
            token: data.accessToken,
            nickname: data.nickname,
            avatar: (data.avatar && data.avatar.default) || ''
          });
        } else {
          resolve({});
        }
      },
      fail: (data, errNo) => {
        if (+errNo === 201) {
          console.log('当前手机系统未登陆华为账号');
        } else {
          // console.log(`(${errNo}): account.authorize error = ${JSON.stringify(data, null, 4)}`);
        }
        resolve({});
      }
    });
  });
};

const requestUserInfo = async () => {
  let uInfo = {
    nickname: '',
    avatar: ''
  };
  uInfo = await getCode();
  if (uInfo) {
    return uInfo;
  }
  const loginInfo = { userInfo: {} };
  try {
    const { data } = await http.get('/user/info', {}, { apiVersion: '/api/v1' });
    if (data.message && +data.message.code === 200 && data.result) {
      loginInfo.userInfo = data.result;
      loginInfo.userInfo.nickname = data.result.name || uInfo.nickname;
      loginInfo.userInfo.avatar = data.result.avatar || uInfo.avatar;
    }
  } catch (e) {
    console.log('request User Info, err = ', JSON.stringify(e, null, 4));
  } finally {
    PubSub.publish(rootStore.UPDATE_USER_INFO, loginInfo);
  }
};

const requestAccessToken = async () => {
  return new Promise(async (resolve) => {
    let success = false;
    try {
      const res = await http.post('/users/anonymousUserLogin', {}, { apiVersion: '/api/v1' }, {}, true); // 去登陆 '/user/login'
      console.log(`匿名登陆 ${JSON.stringify(res, null, 4)}`);
      const { data } = res;
      if (data.message && +data.message.code === 200 && data.result) {
        await rootStore.setGlbHeader(data.result);
        await requestUserInfo();
        success = true;
      } else {
        const errMsg = `服务异常${data.message && data.message.code ? ('(code:' + data.message.code + ')') : ''}`;
        console.log(errMsg);
      }
    } catch (e) {
      console.log('77 get Access Token By Code, err: ', e);
    } finally {
      requesting = false;
      resolve(success);
    }
  });
}

const markAppLogin = () => {
  if (requesting) {
    return Promise.resolve(false);
  }
  requesting = true;
  return new Promise(async (resolve) => {
    const isOk = await requestAccessToken();
    resolve(isOk);
  });
};

const doLogin = {
  requestUserInfo,
  markAppLogin
};

export default doLogin;