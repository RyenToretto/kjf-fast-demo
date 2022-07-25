// https://blog.csdn.net/qq_42331108/article/details/122722300
import storage from '@system.storage';
import http from './http.js';
import calculator from './calculator.js';
import rootStore from './rootStore.js';
import utils from './utils.js';

const AD_TYPE_ORIGIN = 'ad_type_origin';
const AD_TYPE_BANNER = 'ad_type_banner';
const AD_TYPE_REWARD = 'ad_type_reward';
const AD_TYPE_INS = 'ad_type_ins';

const DELAY_LIMIT = '1500';

const labelMap = {
  [AD_TYPE_ORIGIN]: '原生广告',
  [AD_TYPE_BANNER]: 'banner 广告',
  [AD_TYPE_REWARD]: '激励视频广告',
  [AD_TYPE_INS]: '插屏广告'
};

const poorAdMap = {
  [AD_TYPE_ORIGIN]: [
    { adUnitId: 'l47y7w6lf4', price: '100' }, // 原生-底价100
    { adUnitId: 'y541h0h9u5', price: '90' }, // 原生-底价90
    { adUnitId: 'e8yl7t8ap9', price: '70' }, // 原生-底价70
    { adUnitId: 'x5yj31m3uh', price: '50' }, // 原生-底价50
    { adUnitId: 'w3af67y5n8', price: '30' }, // 原生-底价30
    { adUnitId: 'c0b3pjpgx9', price: '10' }, // 原生-底价10
    { adUnitId: 'o6ej0kpt8e', price: '0' } // 原生-底价0
  ],
  [AD_TYPE_BANNER]: [
    { adUnitId: 'w3p488a8gp', price: '100' }, // 横幅-底价100
    { adUnitId: 'k71b9k23i5', price: '90' }, // 横幅-底价90
    { adUnitId: 'k0u5vduxid', price: '80' }, // 横幅-底价80
    { adUnitId: 'l4dxd3yc0w', price: '70' }, // 横幅-底价70
    { adUnitId: 'z2wprgg2ih', price: '60' }, // 横幅-底价60
    { adUnitId: 'o3v5ohgmf5', price: '50' }, // 横幅-底价50
    { adUnitId: 'k23eb00zgj', price: '40' }, // 横幅-底价40
    { adUnitId: 'd3024nanug', price: '30' }, // 横幅-底价30
    { adUnitId: 'y6wjdizfgg', price: '20' }, // 横幅-底价20
    { adUnitId: 'l2syryqtk3', price: '10' }, // 横幅-底价10
    { adUnitId: 'b4mzklpmf5', price: '0' } // 横幅-底价0
  ],
  [AD_TYPE_REWARD]: [
    { adUnitId: 'd3ziu2pva8', price: '2000' }, // 激励-底价2000
    { adUnitId: 'l6tlb5mkb9', price: '1900' }, // 激励-底价1900
    { adUnitId: 'q68e9mssup', price: '1800' }, // 激励-底价1800
    { adUnitId: 'd430hmlmtd', price: '1700' }, // 激励-底价1700
    { adUnitId: 'j0a1qlpvzz', price: '1600' }, // 激励-底价1600
    { adUnitId: 'c13w9trgi6', price: '1500' }, // 激励-底价1500
    { adUnitId: 'x1ezv71ai8', price: '1400' }, // 激励-底价1400
    { adUnitId: 't7d2ctyj24', price: '1300' }, // 激励-底价1300
    { adUnitId: 'w7a6mjbbta', price: '1200' }, // 激励-底价1200
    { adUnitId: 'p9fq2ip8tc', price: '1100' }, // 激励-底价1100
    { adUnitId: 'j22b5agez6', price: '1000' }, // 激励-底价1000
    { adUnitId: 't1bq4lfxtc', price: '900' }, // 激励-底价900
    { adUnitId: 'k8cvzhta4z', price: '800' }, // 激励-底价800
    { adUnitId: 'd52zgi0mo1', price: '700' }, // 激励-底价700
    { adUnitId: 's0mf0bb0qo', price: '600' }, // 激励-底价600
    { adUnitId: 'u072t95kgb', price: '500' }, // 激励-底价500
    { adUnitId: 'h3r16bima9', price: '480' }, // 激励-底价480
    { adUnitId: 's74lko077x', price: '450' }, // 激励-底价450
    { adUnitId: 'n9anh4xbzz', price: '420' }, // 激励-底价420
    { adUnitId: 'b65rb118aj', price: '390' }, // 激励-底价390
    { adUnitId: 'l7w7077zek', price: '360' }, // 激励-底价360
    { adUnitId: 'h8y8860j90', price: '330' }, // 激励-底价330
    { adUnitId: 'm9rpze1v6t', price: '300' }, // 激励-底价300
    { adUnitId: 'w3xq9bab6a', price: '270' }, // 激励-底价270
    { adUnitId: 'b6prbdevso', price: '240' }, // 激励-底价240
    { adUnitId: 'p6bqauvf6g', price: '210' }, // 激励-底价210
    { adUnitId: 'v0vh8zefg8', price: '180' }, // 激励-底价180
    { adUnitId: 'c5y1ysefqd', price: '150' }, // 激励-底价150
    { adUnitId: 'a8pfy6oeik', price: '120' }, // 激励-底价120
    { adUnitId: 'f7wos6v42h', price: '90' }, // 激励-底价90
    { adUnitId: 'n2d76749ts', price: '60' }, // 激励-底价60
    { adUnitId: 'b4d6rz09ix', price: '30' }, // 激励-底价30
    { adUnitId: 'x82w442y8r', price: '0' } // 激励-底价0
  ],
  [AD_TYPE_INS]: [
    { adUnitId: 'q14ni2wkvq', price: '2000' }, // 插屏-底价2000
    { adUnitId: 'e0bkxdamsq', price: '1900' }, // 插屏-底价1900
    { adUnitId: 'f19w6giv5a', price: '1800' }, // 插屏-底价1800
    { adUnitId: 't842xxll95', price: '1700' }, // 插屏-底价1700
    { adUnitId: 'c2lu77sdpq', price: '1600' }, // 插屏-底价1600
    { adUnitId: 'l9tqufn3bk', price: '1500' }, // 插屏-底价1500
    { adUnitId: 'q5ded9ve4k', price: '1400' }, // 插屏-底价1400
    { adUnitId: 'o4kl4ae4e3', price: '1300' }, // 插屏-底价1300
    { adUnitId: 'd6nkf4lgrx', price: '1200' }, // 插屏-底价1200
    { adUnitId: 'o1b8cuzjvu', price: '1100' }, // 插屏-底价1100
    { adUnitId: 'c92fzmtsac', price: '1000' }, // 插屏-底价1000
    { adUnitId: 'g32bczny7f', price: '900' }, // 插屏-底价900
    { adUnitId: 'b25futofdp', price: '800' }, // 插屏-底价800
    { adUnitId: 'e2t1szd1xl', price: '700' }, // 插屏-底价700
    { adUnitId: 'o84en1a952', price: '600' }, // 插屏-底价600
    { adUnitId: 'n932gtvcfq', price: '500' }, // 插屏-底价500
    { adUnitId: 'w853ria4tg', price: '480' }, // 插屏-底价480
    { adUnitId: 's8dpu8h9f2', price: '450' }, // 插屏-底价450
    { adUnitId: 'd328pfz66n', price: '420' }, // 插屏-底价420
    { adUnitId: 'i23ws3pemd', price: '390' }, // 插屏-底价390
    { adUnitId: 'i9xdrjjhm0', price: '360' }, // 插屏-底价360
    { adUnitId: 'y7glwaj7ap', price: '330' }, // 插屏-底价330
    { adUnitId: 'b1dua72jt0', price: '300' }, // 插屏-底价300
    { adUnitId: 'h17x6r5z6s', price: '270' }, // 插屏-底价270
    { adUnitId: 'b07jzver31', price: '240' }, // 插屏-底价240
    { adUnitId: 'h8vi702k9c', price: '210' }, // 插屏-底价210
    { adUnitId: 'w1nm7bztg7', price: '180' }, // 插屏-底价180
    { adUnitId: 'b5t1egh3wb', price: '150' }, // 插屏-底价150
    { adUnitId: 'x3vsa5s9ix', price: '120' }, // 插屏-底价120
    { adUnitId: 'o35yw431t8', price: '90' }, // 插屏-底价90
    { adUnitId: 't1c7menhs7', price: '60' }, // 插屏-底价60
    { adUnitId: 's3ffqp45y4', price: '30' }, // 插屏-底价30
    { adUnitId: 'x8f9jdwktu', price: '0' } // 插屏-底价0
  ]
};

const IS_DEV = process.env.NODE_ENV !== 'production';
// const IS_DEV = false;
const TEST_AD_MAP = {
  [AD_TYPE_ORIGIN]: [
    { adUnitId: 'u7m3hc4gvm', price: 0 }
  ],
  [AD_TYPE_BANNER]: [
    { adUnitId: 'x0kvs12iu6', price: 0 }
  ],
  [AD_TYPE_REWARD]: [
    { adUnitId: 'testx9dtjwj8hp', price: 0 }
  ],
  [AD_TYPE_INS]: [
    { adUnitId: 'x8f9jdwktu', price: 10 },
    { adUnitId: 's3ffqp45y4', price: 0 }
  ]
}

const getAdId = (adPoor, adType, isDev = IS_DEV) => {
  if (!adPoor || !adPoor[0]) {
    return;
  }
  /*
  if (!isDev) {
      const { price, adUnitId } = adPoor[0];
      adType === AD_TYPE_INS && console.log(`\n\n====>尝试底价为 ￥${price} 的${labelMap[adType]} ID: ${adUnitId}`);
  }
  */
  return adPoor[0];
};

let adCount = 1;
let priceCount = 0;
const pMap = {};
const adXHReport = async () => {
  if (adCount >= 101) {
    return;
  }

  const { pkg } = rootStore.getGlbParams();
  const sKey = pkg.replace(/\./ig, '_');
  const sValue = await utils.promiseFactory(storage.get, { key: `${sKey}_ad_${adCount}` });
  +sValue !== 1 && http.xhReport('https://xe.xdplt.com/adtrack', `ad_${adCount++}`, {});
  +sValue !== 1 && console.log(`**************** (ad_${adCount - 1}) ****************${priceCount}`);
  await utils.promiseFactory(storage.set, { key: `${sKey}_ad_${adCount - 1}`, value: 1 });
};

const arpuXHReport = async (idPoor) => {
  const { price } = idPoor[0];
  priceCount = Math.floor(calculator.fDiv((priceCount + price), 100));
  priceCount = priceCount >= 30 ? 30 : priceCount; // arpu_3000 (每次展示把底价累加)
  if (priceCount >= 1 && !pMap[priceCount]) {
    const { pkg } = rootStore.getGlbParams();
    const sKey = pkg.replace(/\./ig, '_');
    const sValue = await utils.promiseFactory(storage.get, { key: `${sKey}_arpu_${calculator.fMul(priceCount, 100)}` });
    +sValue !== 1 && http.xhReport('https://xe.xdplt.com/adtrack', `arpu_${calculator.fMul(priceCount, 100)}`, {});
    +sValue !== 1 && console.log(`**************** (arpu_${calculator.fMul(priceCount, 100)}) ****************${priceCount}-${price}`);
    await utils.promiseFactory(storage.set, { key: `${sKey}_arpu_${calculator.fMul(priceCount, 100)}`, value: 1 });
  }
  pMap[priceCount] = true;
};

const dealAdIdErr = (adPoor, adType, isDev = IS_DEV) => {
  if (!adPoor || !adPoor[0]) {
    return false;
  }
  const failAdInfo = adPoor.shift();
  adPoor.push(failAdInfo);
  /*
  if (!isDev) {
      adType === AD_TYPE_INS && console.log(`底价为 ￥${failAdInfo.price} 的${labelMap[adType]} 尝试失败ID: ${failAdInfo.adUnitId} 调整至队尾`);
  }
  */
  console.log(`${labelMap[adType]}(${+failAdInfo.price !== 0}): 底价为 ￥${failAdInfo.price}`);
  return +failAdInfo.price !== 0;
};

const poorAd = {
  AD_TYPE_ORIGIN,
  AD_TYPE_BANNER,
  AD_TYPE_REWARD,
  AD_TYPE_INS,
  getAdId,
  adXHReport,
  arpuXHReport,
  dealAdIdErr,
  isDev: IS_DEV,
  DELAY_LIMIT,
  poorAdMap,
  TEST_AD_MAP
};

export default poorAd
