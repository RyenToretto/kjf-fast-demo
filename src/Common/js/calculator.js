/**
 * 获取两个数小数点的长度最大值，然后取10的次幂
 * @param {*} num1
 * @param {*} num2
 */
const getPointPow = (num1, num2) => {
  let pointLength1 = 0;
  let pointLength2 = 0;
  if ((num1 + '').indexOf('.') >= 0) { // 如果存在小数点
    pointLength1 = (num1 + '').split('.')[1].length;
  }

  if ((num2 + '').indexOf('.') >= 0) { // 如果存在小数点
    pointLength2 = (num2 + '').split('.')[1].length;
  }
  return Math.pow(10, Math.max(pointLength1, pointLength2));
};

const calculator = {
  fAdd: (num1, num2) => { // 加法
    let pow = getPointPow(num1, num2);
    return (calculator.fMul(num1, pow) + calculator.fMul(num2, pow)) / pow;
  },
  fSub: (num1, num2) => { // 减法
    let pow = getPointPow(num1, num2);
    return (calculator.fMul(num1, pow) - calculator.fMul(num2, pow)) / pow;
  },
  fMul: (num1, num2) => { // 乘法
    let pow = getPointPow(num1, num2);
    let s1 = num1.toString();
    let s2 = num2.toString();
    return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / pow;
  },
  fDiv: (num1, num2) => { // 除法
    let pow = getPointPow(num1, num2);
    return (calculator.fMul(num1, pow) / calculator.fMul(num2, pow)) / pow;
  }
};

export default calculator;
