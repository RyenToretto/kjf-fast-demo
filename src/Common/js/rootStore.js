import storage from '@system.storage';
import device from '@system.device';
import network from '@system.network'
import app from '@system.app'
import utils from './utils.js'
import md5 from "./md5.js";

const SALT = '3582d6815e095be3d83fecae039ef46e88cff3844bba6c5f703dae669a9a6647';

let tempDeviceInfo = {};

const glbParams = {
  tk: '', // 用户唯一标识
  pkg: '', // 包名
  vn: '', // 版本名
  lang: '', // 语言
  ts: '', // 时间戳
  vc: '' // 版本code
};

const trackParams = {
  app_channel: '',
  v: '', // 版本号
  immd5: '', // device.getId(OBJECT)  的 device的md5
  imnewmd5: '', // device.getId(OBJECT)  的 device的md5
  anid: '', // device.getId(OBJECT)  的 user
  mac: '', // device.getId(OBJECT)  的 mac
  vs: '', // device.getInfo(OBJECT) 的 platformVersionName
  brand: '', // 品牌
  vendor: '', // 厂商
  model: '', // 型号
  os: '', // 操作系统
  sdk: '', // osVersionCode 操作系统版本号
  locale: '', // 地区
  w: '', // 屏宽
  h: '', // 屏高
  dpi: '', // screenDensity * 160
  ntt: '', // 网络类型
  op: '', // 获取SIM卡的拜访地信息 network.getNetworkOperator(OBJECT) 的 operator
  oaid: '', // device.getOAID(OBJECT)
  udid: ''
};

const ibuParams = {
  isPaidUser: false
}

const glbHeader = {
  accessToken: ''
};

const setGlbHeader = (obj) => {
  return new Promise(async (resolve) => {
    for (const [key, value] of Object.entries(obj)) {
      glbHeader[key] = value;
      if (key === 'accessToken') {
        await utils.promiseFactory(storage.set, { key: 'access_token', value });
      }
    }
    resolve(glbHeader);
  });
};

const getGlbHeader = () => {
  return glbHeader;
};

const setOAID = () => {
  return new Promise((resolve => {
    device.getOAID({
      type: ['device'],
      success: function ({ oaid }) {
        trackParams.oaid = oaid;
        resolve({ oaid });
      },
      fail: () => resolve({})
    });
  }));
};

const setIDInfo = () => {
  return new Promise((resolve => {
    device.getId({
      type: ['device', 'user', 'mac'],
      success: function ({ device, user, mac }) {
        const token = device || user;
        glbParams.tk = token;
        glbParams.udid = token;
        trackParams.immd5 = md5(token);
        trackParams.imnewmd5 = md5(token);
        trackParams.anid = user;
        trackParams.mac = mac;
        resolve({ idInfo: { device, user, mac } });
      },
      fail: () => resolve({})
    });
  }));
};

const setDeviceInfo = () => {
  return new Promise((resolve => {
    device.getInfo({
      success: (deviceInfo) => {
        glbParams.lang = deviceInfo.language;
        trackParams.vs = deviceInfo.platformVersionName;
        trackParams.brand = deviceInfo.brand;
        trackParams.manu = deviceInfo.brand.toLocaleLowerCase();
        trackParams.app_channel = trackParams.manu;
        trackParams.model = deviceInfo.model;
        trackParams.vendor = deviceInfo.vendorOsName;
        trackParams.os = deviceInfo.osType;
        trackParams.plat = 'android';
        trackParams.sdk = deviceInfo.osVersionCode;
        trackParams.sysv = deviceInfo.osVersionCode;
        trackParams.sdkna = '0.0.1';
        trackParams.fis = 0;
        trackParams.installer = '';
        trackParams.net = 0;
        trackParams.locale = deviceInfo.region;
        trackParams.w = deviceInfo.windowWidth;
        trackParams.h = deviceInfo.windowHeight;
        trackParams.dpi = deviceInfo.screenDensity * 160;
        tempDeviceInfo = deviceInfo;
        resolve({ deviceInfo });
      },
      fail: () => resolve({})
    });
  }));
};

const setNetworkInfo = () => {
  return new Promise((resolve => {
    Promise.all([
      new Promise(resolve => {
        network.getType({
          success: (networkInfo) => {
            trackParams.ntt = networkInfo.type;
            resolve({ networkInfo })
          },
          fail: () => resolve({})
        });
      }),
      new Promise(resolve => {
        if (!network.getNetworkOperator) {
          resolve({});
          return;
        }
        network.getNetworkOperator({
          success: (networkOperator) => {
            for (const i in networkOperator.operators) {
              if (networkOperator.operators[i].isDefaultDataOperator) {
                trackParams.op = networkOperator.operators[i].operator;
              }
            }
            resolve({ networkOperator });
          },
          fail: (res) => resolve({ res })
        });
      })
    ])
      .then(([networkInfo, networkOperator]) => {
        resolve({ networkInfo, networkOperator });
      })
      .catch(e => {
        console.log('set Network Info error: ', e);
      })
  }));
};

const setGlbParams = () => {
  return new Promise((resolve) => {
    const { packageName, versionName } = app.getInfo();
    glbParams.pkg = packageName;
    // glbParams.pkg = 'com.xmall.ok.gbox'; // TODO 沙盒/线上
    glbParams.vn = versionName;
    trackParams.appvn = versionName;
    trackParams.v = versionName.split('.').join('');
    trackParams.appv = trackParams.v;
    Promise.all([
      setIDInfo(),
      setDeviceInfo(),
      setNetworkInfo(),
      setOAID()
    ])
      .then(() => {
        resolve({ deviceInfo: tempDeviceInfo, glbParams, trackParams });
      })
      .catch(() => resolve({}));
  });
};

const getGlbParams = () => {
  glbParams.ts = Date.now();
  const { tk, pkg, vn, lang, ts } = glbParams;
  glbParams.vc = md5(tk + pkg + vn + lang + ts + SALT);
  return glbParams;
};

const getTrackParams = () => {
  const glbParams = getGlbParams();
  return { ...trackParams, ...glbParams, ...ibuParams };
};

const BAIDU = 'baidu';

const engineMap = {
  [BAIDU]: 'https://m.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd='
}

const labelEngine = {
  [BAIDU]: '百度'
}

let curSearchEngine = BAIDU;

export const setSearchEngine = (newEngine) => {
  curSearchEngine = newEngine;
};

export const getSearchEngine = () => {
  return engineMap[curSearchEngine];
};

const setIbuParams = (ibu, inBlackList) => {
  ibuParams.isPaidUser = !!(ibu && !inBlackList)
}

const rootStore = {
  BAIDU,
  engineMap,
  labelEngine,
  setSearchEngine,
  getSearchEngine,
  DO_INIT: 'do_init',
  FIRST_OPEN: 'first_open',
  UPDATE_USER_INFO: 'update_user_info',
  INIT_DONE: 'init_done',
  SET_AD_PURE: 'set_ad_pure',
  SET_AD_CUSTOM: 'set_ad_custom',
  glbParams,
  setGlbParams,
  getGlbParams,
  getTrackParams,
  glbHeader,
  setGlbHeader,
  getGlbHeader,
  setIbuParams
};

export default rootStore;
