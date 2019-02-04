import { request } from '../../utils/request.js'

Page({
  data: {
    coverList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      openId: wx.getStorageSync('openid'),
      userInfo: wx.getStorageSync('userInfo'),
      avatarUrl: wx.getStorageSync('userInfo').avatarUrl || '',
      nickName: wx.getStorageSync('userInfo').nickName || ''
    });
    this.seachTempCard();
    // this.getWecharToken();
    // this.getwxacode();
  },

  // 获取手机号
  // getwxacode() {
  //   request({
  //     url: 'https://api.weixin.qq.com/wxa/getwxacode?access_token=18_pDAtHpaXyUaB6F4QuD7apvEHPtgMwgk7YE7emMlhaV-sxwglnNQAVAxFiw3gzrVnGBz9uapw5dQNJ5qLxLE-jLsPHajJCgc9bf0xIhVHGasSwIiUOtWAo6WDm3hJG9Z5vRfvb-kSI-BMhjSCUBLdAEAYFP',
  //   }).then(res => {
     
  //   })
  // },
  // 获取手机号
  getPhoneeInes() {
    request({
      url: 'system/Greetingcard/getPhoneeInes.do',
    }).then(res => {
      this.setData({
        coverList: res.data
      })
    })
  },

  //获取token
  getWecharToken() {
    request({
      url: 'system/Greetingcard/getWecharToken.do',
      method: 'POST',
      data: {}
    }).then(res => {
      console.log(res)
    })
  },

  //获取模板
  seachTempCard() {
    request({
      url: 'system/Greetingcard/seachTempCard.do',
    }).then(res => {
      res.data.splice(0, res.data.length - 1);
      this.setData({
        coverList: res.data
      })
      wx.hideLoading();
    })
  },

  toCardItem(e){
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/cardItem/cardItem?id=${id}`
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})