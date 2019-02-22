import {
  request
} from '../../utils/request.js'

Page({
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
      title: '加载中...'
    });
    this.setData({
      openId: wx.getStorageSync('openid'),
      userInfo: wx.getStorageSync('userInfo'),
      avatarUrl: wx.getStorageSync('userInfo').avatarUrl || '',
      nickName: wx.getStorageSync('userInfo').nickName || ''
    });
    this.seachTempCard();
  },

  //获取模板
  seachTempCard() {
    request({
      url: 'system/Greetingcard/seachTempCard.do',
      method: 'POST',
      data: {
        page: this.data.page
      }
    }).then(res => {
      this.setData({
        coverList: res.data.datalist,
        page: res.data.page
      })
      wx.hideLoading();
    })
  },

  toCardItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/cardItem/cardItem?id=${id}`
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
      userInfo: wx.getStorageSync('userInfo')
    });
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
        url: 'system/Greetingcard/seachTempCard.do',
        method: 'POST',
        data: {
          page: 0
        }
      }).then(res => {
        wx.stopPullDownRefresh();
        this.setData({
          coverList: this.data.coverList.concat(res.data.datalist),
          page: res.data.page,
          more: res.data.more
        })
        wx.hideLoading();
      })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.more) {
      wx.showLoading({
        title: '加载更多...'
      });
      request({
        url: 'system/Greetingcard/seachTempCard.do',
        method: 'POST',
        data: {
          page: this.data.page
        }
      }).then(res => {
        this.setData({
          coverList: this.data.coverList.concat(res.data.datalist),
          page: res.data.page,
          more: res.data.more
        })
        wx.hideLoading();
      })
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

  },
  test(){
    wx.navigateTo({
      url: '/pages/creatCard/creatCard?getById=435',
    })
  }
})