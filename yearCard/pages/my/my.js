import {
  request
} from '../../utils/request.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    more: true,
    coverList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      openId: wx.getStorageSync('openid'),
      userInfo: wx.getStorageSync('userInfo'),
      avatarUrl: wx.getStorageSync('userInfo').avatarUrl || '',
      nickName: wx.getStorageSync('userInfo').nickName || '',
    });
    this.loginTag();
    this.getAllUserCard();

  },

  //我的贺卡
  getAllUserCard() {
    request({
      url: 'system/Greetingcard/getAllUserCard.do',
      method: 'POST',
      data: {
        openId: this.data.openId || '',
        page: this.data.page
      }
    }).then(res => {
      if (res.statusCode == 200) {
        // res.data.datalist.splice(0, res.data.datalist.length-1);
        this.setData({
          coverList: res.data.datalist,
          page: res.data.page
        });
      }
      wx.hideLoading();
    });
  },

  // 验证有无绑定
  loginTag() {
    request({
      url: 'system/Greetingcard/loginTag.do',
      method: 'POST',
      data: {
        openId: this.data.openId
      }
    }).then(res => {
      if (!res.data.flag) {
        this.bingwecharUser();
      } else {
        this.setData({
          infos: res.data.info,
          headLow: res.data.info.v_wechar_image_low
        });
      }
    });
  },

  //绑定
  bingwecharUser() {
    request({
      url: 'system/Greetingcard/bingwecharUser.do',
      method: 'POST',
      data: {
        openId: this.data.openId,
        v_nc_name: this.data.nickName,
        filePath: this.data.avatarUrl
      }
    }).then(res => {
      if (res.data.flag) {
        this.setData({
          //绑定时返回的头像短路径
          headLow: res.data.v_wechar_image_low
        })
      }
    });
  },

  toTycz() {
    wx.navigateToMiniProgram({
      appId: 'wxa9e3302fab960815',
      path: 'pages/login/userLogin/userLogin',
      extraData: {},
      success(res) {}
    })
  },

  userInfoHandler(e) {
    if (e.detail.userInfo) {
      wx.setStorageSync('userInfo', e.detail.userInfo);
      this.setData({
        userInfo: e.detail.userInfo,
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName
      });
    }
  },

  toMyCardItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/myCardItem/myCardItem?id=${id}`
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      page: 0
    })
    this.getAllUserCard();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showLoading({
      title: '刷新中...'
    })
    request({
      url: 'system/Greetingcard/getAllUserCard.do',
      method: 'POST',
      data: {
        openId: this.data.openId || '',
        page: 0
      }
    }).then(res => {
      if (res.statusCode == 200) {
        this.setData({
          coverList: this.data.coverList.concat(res.data.datalist),
          page: res.data.page,
          more: res.data.more
        });
      }
      wx.hideLoading();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.more) {
      wx.showLoading({
        title: '加载更多...'
      })
      request({
        url: 'system/Greetingcard/getAllUserCard.do',
        method: 'POST',
        data: {
          openId: this.data.openId || '',
          page: this.data.page
        }
      }).then(res => {
        if (res.statusCode == 200) {
          this.setData({
            coverList: this.data.coverList.concat(res.data.datalist),
            page: res.data.page,
            more: res.data.more
          });
        }
        wx.hideLoading();
      });
    } else {
      wx.showToast({
        title: '没有更多数据',
        icon: 'none'
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})