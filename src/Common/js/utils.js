/**
 * 您可以将常用的方法、或系统 API，统一封装，暴露全局，以便各页面、组件调用，而无需 require / import.
 */
import calculator from "./calculator";
import prompt from "@system.prompt";

const decodeToken = '%[a-f0-9]{2}';
const singleMatcher = new RegExp(decodeToken, 'gi');
const multiMatcher = new RegExp('(' + decodeToken + ')+', 'gi');

const strToDate = function (dateStr) {
  let splitArr = dateStr.split(' ');
  let dateArr = splitArr[0].split('-');
  let timeArr = splitArr[1] ? splitArr[1].split(':') : [];
  let newDate = new Date();
  newDate.setFullYear(dateArr[0]);
  newDate.setMonth(Number(dateArr[1]) - 1);
  newDate.setDate(dateArr[2]);
  newDate.setHours(timeArr[0] || 0, timeArr[1] || 0, timeArr[2] || 0, timeArr[3] || 0);
  return newDate;
};

const lessTenFormat = function (num) {
  if (isNaN(num) || num < 0) {
    return '';
  }
  let newNum = Number(num);
  return newNum >= 10 ? newNum : `0${num}`
};

/**
 * 拼接 url 和参数
 */
const queryString = (url, query) => {
  let str = [];
  for (let key in query) {
    str.push(key + '=' + query[key]);
  }
  let paramStr = str.join('&');
  return paramStr ? `${url}?${paramStr}` : url;
};

const showToast = (message = '', duration = 0, gravity = 'center') => {
  if (!message) { return; }
  prompt.showToast({
    message: message,
    duration,
    gravity
  });
};

const showDialog = (args) => {
  if (!args) { return; }
  prompt.showDialog(args);
};

const promiseFactory = (callback, params = {}) => {
  return new Promise((resolve, reject) => {
    params = Object.assign({
      success: (data) => { resolve(data); },
      fail: (err, code) => { reject(err, code) }
    }, params);
    callback(params);
  });
};

const decodeComponents = (components, split) => {
  try { // Try to decode the entire string first
    return decodeURIComponent(components.join(''));
  } catch (err) {
  }

  if (components.length === 1) {
    return components;
  }

  split = split || 1;

  var left = components.slice(0, split); // Split the array in 2 parts
  var right = components.slice(split);

  return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
};

const decode = (regStr) => {
  try {
    return decodeURIComponent(regStr);
  } catch (err) {
    var tokens = regStr.match(singleMatcher);
    for (var i = 1; i < tokens.length; i++) {
      regStr = decodeComponents(tokens, i).join('');

      tokens = regStr.match(singleMatcher);
    }
    return regStr;
  }
};

const decodeUrl = (encodedURI) => { // Keep track of all the replacements and prefill the map with the `BOM`
  var replaceMap = {
    '%FE%FF': '\uFFFD\uFFFD',
    '%FF%FE': '\uFFFD\uFFFD'
  };

  var match = multiMatcher.exec(encodedURI);
  while (match) {
    try { // Decode as big chunks as possible
      replaceMap[match[0]] = decodeURIComponent(match[0]);
    } catch (err) {
      var result = decode(match[0]);

      if (result !== match[0]) {
        replaceMap[match[0]] = result;
      }
    }

    match = multiMatcher.exec(encodedURI);
  }

  // Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
  replaceMap['%C2'] = '\uFFFD';

  var entries = Object.keys(replaceMap);

  for (var i = 0; i < entries.length; i++) { // Replace all decoded components
    var key = entries[i];
    encodedURI = encodedURI.replace(new RegExp(key, 'g'), replaceMap[key]);
  }

  return encodedURI;
};

const getRealType = (obj) => {
  var toString = Object.prototype.toString;
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  };
  return map[toString.call(obj)];
};

const deepClone = (data, noEmptyProperty = false) => {
  let _type = getRealType(data);
  let copyOfObj;

  if (_type === 'array') {
    copyOfObj = [];
  } else if (_type === 'object') {
    copyOfObj = {};
  } else {
    return data;
  }

  for (const [key, value] of Object.entries(data)) {
    if (noEmptyProperty && (value === '' || value === null || value === undefined)) {
      continue;
    }
    copyOfObj[key] = deepClone(value);
  }

  return copyOfObj;
};


// 分转换成元
const fenMoney = (amount, decimalLength = 2) => {
  if (!amount) {
    return amount;
  }
  return calculator.fMul(amount, 0.01).toFixed(decimalLength);
};

// 945128 => 94.51
const toWan = (num, decimalLength = 2) => {
  if (!num) {
    return num;
  }
  return calculator.fMul(num, 0.0001).toFixed(decimalLength);
};

const dateFormat = (str, format = 'YYYY-MM-dd') => {
  let date = new Date(str);
  let dateStr = '';
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  if (date.toString() === 'Invalid Date' || !str) {
    return '';
  }
  month < 10 && (month = '0' + month);
  day < 10 && (day = '0' + day);
  hour < 10 && (hour = '0' + hour);
  minute < 10 && (minute = '0' + minute);
  second < 10 && (second = '0' + second);

  dateStr = format.replace(/Y{1,4}/i, year)
    .replace(/M{1,2}/, month)
    .replace(/d{1,2}/i, day)
    .replace(/h{1,2}/i, hour)
    .replace(/m{1,2}/, minute)
    .replace(/s{1,2}/i, second);
  return dateStr;
};

export const formatOnlyMin = (endTime) => {
  let secondTime = parseInt(endTime) // 将传入的秒的值转化为Number
  let min = 0 // 初始化分
  if (secondTime > 60) { // 如果秒数大于60，将秒数转换成整数
    min = parseInt('' + (secondTime / 60)) // 获取分钟，除以60取整数，得到整数分钟
    secondTime = parseInt('' + (secondTime % 60)) // 获取秒数，秒数取佘，得到整数秒数
  }
  if (secondTime) {
    min = min + +((secondTime / 60).toFixed(1))
  }
  return `${min}min`
}

export const formatSeconds = (endTime, showH = true) => {
  let secondTime = parseInt(endTime) // 将传入的秒的值转化为Number
  let min = 0 // 初始化分
  let h = 0 // 初始化小时
  if (secondTime > 60) { // 如果秒数大于60，将秒数转换成整数
    min = parseInt('' + (secondTime / 60)) // 获取分钟，除以60取整数，得到整数分钟
    secondTime = parseInt('' + (secondTime % 60)) // 获取秒数，秒数取佘，得到整数秒数
    if (min > 60) { // 如果分钟大于60，将分钟转换成小时
      h = parseInt('' + (min / 60)) // 获取小时，获取分钟除以60，得到整数小时
      min = parseInt('' + (min % 60)) // 获取小时后取佘的分，获取分钟除以60取佘的分
    }
  }
  if (showH) {
    const realH = (h > 0)
      ? (h.toString().padStart(2, '0') + ':')
      : ''
    const realMin = (min > 0 || h > 0)
      ? (min.toString().padStart(2, '0') + ':')
      : '00:'
    const realS = (secondTime > 0 || min > 0 || h > 0)
      ? secondTime.toString().padStart(2, '0')
      : ''
    return realH + realMin + realS
  } else {
    return `${min.toString().padStart(2, '0')}:${secondTime.toString().padStart(2, '0')}`
  }
}

export const secondsToHMS = (value, onlyMin = false, showH = true) => {
  if (value && !Object.is(+value, NaN)) {
    if (onlyMin) {
      return formatOnlyMin(value)
    } else {
      return formatSeconds(value, showH)
    }
  }
  return value
}

export const UTCformat = (utc) => {
  const date = new Date(utc);
  // const year = date.getFullYear();
  const month = date.getMonth()+1 > 9 ? date.getMonth()+1 : '0' + parseInt(date.getMonth()+1);
  const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
  // const hour =  date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
  // const minutes = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
  // const seconds = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
  // return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' +seconds;
  return month + '-' + day;
}

export const kwNumber = (num) => {
  return num >= 1e3 && num < 1e4 ? (num / 1e3).toFixed(1) + 'k' : num >= 1e4 ? (num / 1e4).toFixed(1) + 'w' : num
}

const sortArrayByDateField = (objectArr, field = 'date', descending = true) => {
  if (getRealType(objectArr) === 'array') {
    return objectArr.sort((a, b) => {
      const value1 = a[field]
      const value2 = b[field]
      if (descending) { // 降序
        return value2 - value1
      } else { // 升序
        return value1 - value2
      }
    })
  }
  return objectArr
}

const getRandomInt = (min, max) => {
  const minNum = Math.ceil(min)
  const maxNum = Math.floor(max)
  return Math.floor(Math.random() * (maxNum - minNum)) + minNum
}

let intervalTimer = null;
const setInterval = (callback, interval) => {
  const now = Date.now;
  let startTime = now();
  let endTime = startTime;

  const loop = () => {
    intervalTimer = global.requestAnimationFrame && global.requestAnimationFrame(loop);
    endTime = now();
    if (endTime - startTime >= interval) {
      startTime = endTime = now();
      callback();
    }
  };
  intervalTimer = global.requestAnimationFrame && global.requestAnimationFrame(loop);
  return intervalTimer;
};

const clearInterval = (intervalTimerId) => {
  global.cancelAnimationFrame && global.cancelAnimationFrame(intervalTimerId);
  intervalTimerId = null;
};

let calculateRate = 1;

const utils = {
  strToDate,
  lessTenFormat,
  queryString,
  showToast,
  showDialog,
  promiseFactory,
  decodeUrl,
  getRealType,
  deepClone,
  fenMoney,
  toWan,
  dateFormat,
  formatOnlyMin,
  formatSeconds,
  secondsToHMS,
  UTCformat,
  kwNumber,
  sortArrayByDateField,
  getRandomInt,
  setInterval,
  clearInterval,
  setDeviceWidth(windowWidth) {
    calculateRate = 720 / windowWidth;
  },
  toDesignPX(devicePX) {
    return devicePX * calculateRate;
  },
  toDevicePX(designPX) {
    return designPX / calculateRate;
  }
};

export default utils
