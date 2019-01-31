const app = getApp();
const host = 'https://xcx.lebeitong.com/';
// const host = 'http://192.168.2.146:8080/lbt-xcx-server/';

const request = ({url,data = {},method = 'GET'}) => {
  return new Promise(function(resolve, reject) {
    _request(url, resolve, reject, data, method)
  })
}

const _request = (url, resolve, reject, data = {}, method = 'GET') => {
  wx.request({
    url: host + url,
    // url: url,
    header: {
      "content-type": "application/json"
    },
    data: data,
    method: method,
    success: res => {
      resolve(res)
    },
    fail: () => {
      reject('接口请求失败')
    },
    complete: () => {
      wx.hideLoading();
    }
  })
}


module.exports = {
  request
}