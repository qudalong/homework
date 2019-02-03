import {
  request
} from '../../utils/request.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    i:0,
    headLow: '',
    wishList: [],
    v_phone: '',
    curIndex: '',
    nickName: '',
    cardTitle: '',
    cardContent: '',
    gardenInfo: '',
// 解决textare
    txtRealContent: '',
    txtContent: '',
    showMoreWish: false,
    txtHeight: 0
  },

// 解决textare
  textAreaLineChange(e) {
    this.setData({ txtHeight: e.detail.height })
  },
  txtInput(e) {
    this.setData({ txtContent: e.detail.value })
  },
  changeMaskVisible(e) {
    if (!this.data.showMoreWish) {
      // 将换行符转换为wxml可识别的换行元素 <br/>
      const txtRealContent = this.data.txtContent.replace(/\n/g, '<br/>')
      this.setData({ txtRealContent })
    }
    this.setData({ showMoreWish: !this.data.showMoreWish })
  },
  // 换一句
  changeWishItem(){
   let {wishList}=this.data;
    if (this.data.i>wishList.length){
      this.data.i=0;
   }
   this.data.i++;
   this.setData({
     cardContent: wishList[this.data.i].v_content
   });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const userInfo = wx.getStorageSync('userInfo');
    const itemInfo = JSON.parse(options.itemInfo);
    this.setData({
      avatarUrl: itemInfo.avatarUrl,
      nickName: itemInfo.nickName,
      cardTitle: itemInfo.cardTitle||'',
      cardContent: itemInfo.cardContent || '',
      gardenInfo: itemInfo.gardenInfo || '',
    });
    this.seachzf();
  },

  onUnload: function () {
    const pages = getCurrentPages();
    const currPage = pages[pages.length - 1];
    const prevPage = pages[pages.length - 2];
    prevPage.setData({
      cardTitle: this.data.cardTitle,
      avatarUrl: this.data.avatarUrl,
      nickName: this.data.nickName,
      cardContent: this.data.cardContent,
      gardenInfo: this.data.gardenInfo,
      headLow: this.data.headLow//短头像路径
    });
  },


  // 获取祝福
  seachzf() {
    request({
      url: 'system/Greetingcard/seachzf.do',
    }).then(res => {
      this.setData({
        wishList: res.data
      });
    });
  },


  // 获取动画
  saveCard() {
    let {
      nickName,
      cardTitle,
      cardContent
    } = this.data;
    if (!nickName.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return
    } else if (!cardTitle.trim()) {
      wx.showToast({
        title: '请输入祝福标题',
        icon: 'none'
      });
      return
    } else if (!cardContent.trim()) {
      wx.showToast({
        title: '请输入祝福文字',
        icon: 'none'
      });
      return
    }
    wx.navigateBack({
      delta: 1
    })
  },

  uploadOneByOne(imgPaths, successUp, failUp, count, length) {
    wx.uploadFile({
      url: `${app.globalData.url}system/Greetingcard/uploadImages.do`,
      filePath: imgPaths[count],
      name: `banner`,
      success: (e) => {
        successUp++;
        let headFull = JSON.parse(e.data).resultPath;
        let headLow = JSON.parse(e.data).resultPathLow;
        this.setData({
          avatarUrl: headFull,
          headLow: headLow
        });
      },
      fail: (e) => {
        failUp++;
      },
      complete: (e) => {
        count++;
        if (count == length) {
        } else {
          this.uploadOneByOne(imgPaths, successUp, failUp, count, length);
        }
      }
    })
  },

  // 换头像
  changeAvatarUrl: function() {
    wx.showActionSheet({
      itemList: ['拍照', '从手机相册选择'],
      success: (res) => {
        if (res.tapIndex == 0) {
          wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            success: (res) => {
              let successUp = 0;
              let failUp = 0;
              let length = res.tempFilePaths.length;
              let count = 0;
              this.uploadOneByOne(res.tempFilePaths, successUp, failUp, count, length);
            }
          })
        } else if (res.tapIndex == 1) { //相册
          wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success: (res) => {
              let successUp = 0;
              let failUp = 0;
              let length = res.tempFilePaths.length;
              let count = 0;
              this.uploadOneByOne(res.tempFilePaths, successUp, failUp, count, length);
            }
          });
        }
      }
    })
  },

  userName(e) {
    this.setData({
      nickName: e.detail.value
    });
  },
  cardTitle(e) {
    this.setData({
      cardTitle: e.detail.value
    });
  },
  cardContent(e) {
    this.setData({
      cardContent: e.detail.value
    });
  },
  gardenInfo(e) {
    this.setData({
      gardenInfo: e.detail.value
    });
  },

  // 更多祝福
  selectWishItem(e) {
    const curIndex = e.currentTarget.dataset.index;
    this.setData({
      showDialogWord: true,
      cardContent: this.data.wishList[curIndex].v_content
    });
  },

  moreWish() {
    this.setData({
      showMoreWish: true,
    });
  },


  closeDialogWish: function() {
    this.setData({
      showMoreWish: false
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

 

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})