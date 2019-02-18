const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const drawImage = (coverPath_canvas = '', codePath_canvas = '') => {
  const context = wx.createCanvasContext('myCanvas');
  context.rect(0, 0, 320,800);
  context.setFillStyle('#ffffff');
  context.fill();
  context.drawImage(coverPath_canvas,0,420,750,750, 0,0, 320, 320);
  context.drawImage(codePath_canvas, 20, 335, 100, 100);
  context.setFontSize(14);
  context.setFillStyle('#333');
  context.fillText('长按小程序码', 130, 370);
  context.fillText('送您一张祝福贺卡', 130, 390);
  context.fillText('快来看看吧', 130, 410);
  context.draw();
  wx.hideLoading();
}

const savePicToAlbum = tempFilePath => {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.writePhotosAlbum']) {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            wx.saveImageToPhotosAlbum({
              filePath: tempFilePath,
              success(res) {
                wx.showToast({
                  title: '海报已保存到系统相册'
                });
              },
              fail(res) {
                console.log(res);
              }
            })
          },
          fail() {
            // 用户拒绝授权,打开设置页面
            wx.openSetting({
              success: function(data) {
                console.log("openSetting: success");
              },
              fail: function(data) {
                console.log("openSetting: fail");
              }
            });
          }
        })
      } else {
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success(res) {
            wx.showToast({
              title: '保存成功',
            });
          },
          fail(res) {
            console.log(res);
          }
        })
      }
    },
    fail(res) {
      console.log(res);
    }
  })
}

module.exports = {
  formatTime,
  drawImage,
  savePicToAlbum
}