import fetch from '@system.fetch'
import prompt from "@system.prompt";

import rootStore from './rootStore.js'
import utils from './utils.js'

const DO_LOG = false;
let retryCount = 0;
// http://api.tianapi.com/txapi/zaoan/index?key=24d597138c99ebe0e5153d2705e37550
// let BASE_URL = 'http://10.48.0.82:9010/api/v1' // 沙盒接口地址
// let BASE_URL = 'http://oe-book.xdplt.com/api/v1'; // 小说的线上接口地址
let API_VERSION = '/api/v1'
let BASE_URL = 'https://mv-us.xdplt.com'; // 线上接口地址

if (process.env.NODE_ENV === 'production') {
  BASE_URL = "https://mv-us.xdplt.com"; // 线上接口地址
}
const VIDEO_BASE_URL = 'https://mv-video.xdplt.com';

const request = (options = {}, doLog = DO_LOG, isTrack = false, isXH = false) => {
  const { url, data, header = {}, params, method = 'GET', responseType = 'json', apiVersion, baseUrl } = options;
  const theApi = url;
  const originUrl = (url.startsWith('http') ? url : ((baseUrl || BASE_URL) + (apiVersion || API_VERSION) + url));
  let abort = null;
  const abortPromise = new Promise((resolve, reject) => { abort = reject });
  const reqPromise = new Promise((resolve, reject) => {
    if (!originUrl) {
      reject(new Error('地址不存在。'));
      return;
    }
    const glbParams = rootStore.getGlbParams();
    const urlParams = { ...rootStore.getTrackParams(), ...params };
    isXH && (urlParams.retryCount = params.retryCount || retryCount);
    const urlWithParams = utils.queryString(originUrl, urlParams);
    doLog && console.log(`\n\n===> (${method}) ${originUrl}\n===> 请求参数: `, JSON.stringify(urlParams, null, 4));

    const theHeader = utils.deepClone({ ...rootStore.getGlbHeader(), ...header }, true);
    doLog && (JSON.stringify(theHeader) !== '{}') && console.log('===> header: ', JSON.stringify(theHeader, null, 4), '\n\n');

    const theData = isTrack
      ? (isXH
        ? { ...data, ts: urlParams.ts }
        : [{ ...data, todayTime: urlParams.ts, ts: urlParams.ts }])
      : data;
    doLog && theData && console.log('===> 请求体: ', JSON.stringify(theData, null, 4));
    fetch.fetch({
      url: urlWithParams,
      data: theData,
      header: theHeader,
      method,
      responseType,
      success(response) {
        const printLog = theApi !== '/book/category/quick/like';
        if (response.data && response.data.message && +response.data.message.code !== 200) {
          printLog && console.log(`服务异常(${response.data.message.code}): ${theApi} ${response.data.message.messageInfo}`);
          printLog && prompt.showToast({
            message: `${response.data.message.messageInfo}(${response.data.message.code})`
          });
        } else if (+response.code === 500) {
          printLog && console.log(`(${response.code})服务异常: ${theApi} ${response.statusText}`);
          printLog && prompt.showToast({
            message: `${response.statusText}(${response.code})`
          });
        }
        resolve({ ...response, retryCount });
      },
      fail(error, code) {
        !['/user/info'].includes(theApi) && prompt.showToast({
          message: '服务异常，请稍后重试'
        });
        console.log(`\najax error(${code} ${theApi}) =`, error);
        reject(error, code);
      },
      complete(data) {
      }
    })
  })
  const promise = Promise.race([reqPromise, abortPromise]);
  promise.abort = abort;
  return promise;
}

const http = {
  videoBaseUrl: VIDEO_BASE_URL,
  get: (url, params, options = {}, doLog = DO_LOG) => {
    return request({ url, params, method: 'GET', ...options }, doLog);
  },
  requestText: (url, doLog = DO_LOG) => {
    return request({ url, method: 'GET', responseType: 'text' }, doLog);
  },
  post: (url, data, options = {}, params = {}, doLog = DO_LOG) => {
    options.header = {
      // "Content-Type": 'application/x-www-form-urlencoded'
      "Content-Type": 'application/json'
    };
    return request({ url, data, method: 'POST', params, ...options }, doLog);
  },
  delete: (url, params, options = {}, doLog = DO_LOG) => {
    return request({ url, params, method: 'DELETE', ...options }, doLog);
  },
  track: (url, event, data, doLog = DO_LOG) => {
    return request({
      url,
      data: { ...data, event },
      method: 'POST',
      params: {},
      header: { "Content-Type": 'application/json', "Content-Encoding": "application/gzip", "Accept-Encoding": "gzip,deflate" },
      responseType: 'text'
    }, doLog, true);
  },
  xhReport: (url, key, data, doLog = DO_LOG) => {
    return request({
      url,
      data: { ...data, key },
      method: 'POST',
      params: {},
      header: { "Content-Type": 'application/json', "Content-Encoding": "application/gzip", "Accept-Encoding": "gzip,deflate" },
      responseType: 'text'
    }, doLog, true, true);
  },
  xhIBU: (url, params = {}, doLog = DO_LOG) => {
    return request({
      url,
      params: { ...params, retryCount: retryCount++ },
      method: 'GET'
    }, doLog, true, true);
  },
  request
}

export default http;
