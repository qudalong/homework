import {
  request
} from '../../utils/request.js'
import {
  savePicToAlbum
} from '../../utils/util.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    showDialogHaib: false,
    cardInfo: null,
    getById: 0, //保存后返回的模板id
    headLow: '',
    v_music_path_low: '', //音乐
    bannerUrl: '',
    itemInfo: null,
    nickName: '', //用户名
    cardTitle: '', //标题
    cardContent: '', //祝福语
    gardenInfo: '', //园所信息
    userInfo: '',
    autoplay: true, //音乐默认播放
    list: [], //小图片集合
    count: 10,
    showCreateHaib: true,
    showDialog: false,
    showDialogClassify: false,
    showDialogMusic: false,
    showDialogType: false,
    showMoreWish: false,
    showDialogWord: false,
    bannerList: [] //广告图片集合
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中..',
    });
    this.setData({
      id: options.id
    })
    this.getUserCardById(options.id)
  },

  //我的贺卡详情
  getUserCardById(id) {
    request({
      url: 'system/Greetingcard/getUserCardById.do',
      method: 'POST',
      data: {
        id: id
      }
    }).then(res => {
      if (res.statusCode == 200) {
        console.log(res)
        if (res.data) {
          const tempData = res.data;
          wx.setNavigationBarTitle({
            title: tempData.v_card_name
          });
          let bannerList = [];
          const userimages = tempData.userimages;
          if (userimages.length) {
            for (let i in userimages) {
              bannerList.push(userimages[i].v_path)
            }
          }
          this.setData({
            tempData,
            // 页面数据
            v_coverimage_path: tempData.v_coverimage_path,
            cardTitle: tempData.v_card_name,
            nickName: tempData.v_nc_name,
            avatarUrl: tempData.v_wechar_path,
            cardContent: tempData.v_blessing_content,
            v_music_path: tempData.v_music_path,
            gardenInfo: tempData.v_yc_schema,
            flashimages: tempData.flashimages, //下落的图片
            bannerList //广告图片
          })
        }
        this.init();
        this.initStartMusic()
        wx.hideLoading();
      }
    });
  },

  createHaiB() {
    this.setData({
      showDialogHaib: true
    });
    wx.showLoading({
      title: '努力生成中...'
    })
    // 获取二维码
    return request({
      url: 'system/Greetingcard/getSunpath.do',
      method: 'POST',
      data: {
        card_id: this.data.id
      }
    }).then(res => {
      if (res.data.filePath) {
        const context = wx.createCanvasContext('myCanvas');
        const path = this.data.v_coverimage_path;
        const code = res.data.filePath;
        context.drawImage(path, 25, 25, 250, 270);
        context.drawImage(code, 25, 305, 120, 120);
        context.setFontSize(14);
        context.setFillStyle('gray');
        context.fillText('扫描或长按查看贺卡', 150, 375);
        context.draw();
      }
      wx.hideLoading();
    });
  },


  closeDialogHaib() {
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      fileType: 'jpg',
      x: 0,
      y: 50,
      width: this.data.windowWidth,
      height: this.data.contentHeight,
      success: function(res) {
        savePicToAlbum(res.tempFilePath)
      }
    })
    this.setData({
      showDialogHaib: false
    });
  },

  //音乐
  initStartMusic() {
    let {
      v_music_path
    } = this.data;
    var innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.loop = true;
    innerAudioContext.src = v_music_path;
    this.setData({
      innerAudioContext
    });
  },

  stopMusic() {
    this.data.innerAudioContext.pause();
    this.setData({
      autoplay: false
    });
  },
  startMusic() {
    this.data.innerAudioContext.play();
    this.setData({
      autoplay: true
    });
  },

  onUnload: function() {
    this.data.innerAudioContext.destroy();
  },

  // 落叶s
  init() {
    let {
      num,
      list,
      count,
      flashimages
    } = this.data;
    if (flashimages.length) {
      let spicLenght = flashimages.length;
      let a_false_images = [];
      for (let i in flashimages) {
        a_false_images.push(flashimages.v_path_low)
      }

      for (let i = 0; i < count; i++) {
        let spicImgSrc = flashimages[this.randomInteger(1, spicLenght)].v_path;
        let spinAnimationName = (Math.random() < 0.5) ? 'clockwiseSpin' : 'counterclockwiseSpinAndFlip';
        let leafDelay = this.durationValue(this.randomFloat(0, 8));
        let fadeAndDropDuration = this.durationValue(this.randomFloat(5, 11));
        let spinDuration = this.durationValue(this.randomFloat(4, 8));
        list.push({
          src: spicImgSrc,
          left: this.pixelValue(this.randomInteger(0, 360)),
          vAnimationName: `fade, drop`,
          vAnimationDuration: `${fadeAndDropDuration}, ${fadeAndDropDuration}`,
          vAnimationDelay: `${leafDelay}, ${leafDelay}`,
          iAnimationName: spinAnimationName,
          iAnimationDuration: `${spinDuration}`
        })
      }
      this.setData({
        list,
        a_false_images
      })
    }
  },
  randomInteger(low, high) {
    return low + Math.floor(Math.random() * (high - low))
  },

  pixelValue(value) {
    return value + 'px';
  },

  durationValue(value) {
    return value + 's';
  },

  randomFloat(low, high) {
    return low + Math.random() * (high - low);
  },

  //去编辑
  toEdit(e) {
    this.data.innerAudioContext.destroy();
    const templateId = e.currentTarget.dataset.templateid;
    wx.navigateTo({
      url: `/pages/cardItem/cardItem?templateId=${templateId}`
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
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.data.innerAudioContext.destroy();
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
  toHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    let getById = wx.getStorageSync('getById'),
      nickName = this.data.nickName || '',
      coverImg;
    this.data.bannerList.length ? coverImg = this.data.bannerList[0] : coverImg = ''
    if (res.from === 'button') {}
    return {
      title: `【${nickName}】送您一张新年祝福贺卡`,
      imageUrl: coverImg,
      path: `/pages/creatCard/creatCard?getById=${getById}`,
      success: function(res) {}
    }
  }
})