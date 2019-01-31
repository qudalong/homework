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
    showDialogHaib:false,
    cardInfo:null,
    getById: 0, //保存后返回的模板id
    headLow: '',
    itemIndex: 0, //当前模板下表
    v_music_path_low: '', //音乐
    bannerUrl: '',
    itemInfo: null,
    nickName: '', //用户名
    cardTitle: '', //标题
    cardContent: '', //祝福语
    gardenInfo: '', //园所信息
    curIndex: 0, //更多祝福选中第一条
    mindex: 0, //音乐序号
    userInfo: '',
    num: 0, //动画序号
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
    wishList: [], //祝福语
    bannerList: [], //广告图片集合
    musicList: [],
    animateData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中..',
    });
    const index=options.index;
    const seachMusic = this.seachMusic();
    const seachfalsh = this.seachfalsh();
    const seachzf = this.seachzf();
    this.setData({
      index,
      userInfo:wx.getStorageSync('userInfo')
    });
    Promise.all([seachfalsh, seachMusic, seachzf])
      .then(res => {
        this.setData({
          animateData: res[0].data,
          musicList: res[1].data,
          wishList: res[2].data,
          userInfo: wx.getStorageSync('userInfo'),
          // itemIndex,
          //页面数据
          // cardTitle,
          nickName: wx.getStorageSync('userInfo').nickName || '',
          avatarUrl: wx.getStorageSync('userInfo').avatarUrl || '',
          // cardContent: res[0].data[this.data.itemIndex].v_blessing_content,
          // v_coverimage_path: res[0].data[this.data.itemIndex].v_coverimage_path,

          openId: wx.getStorageSync('openid'),
          v_nc_name: wx.getStorageSync('userInfo').nickName,
          filePath: wx.getStorageSync('userInfo').avatarUrl
        });
        // 初始化数据
        this.getAllUserCard(this.data.index);
        // this.init();
         //this.initMusic();
        wx.hideLoading();
      });



    
  },


  // 传照片
  uploadImg: function () {
    wx.showActionSheet({
      itemList: ['拍照', '从手机相册选择'],
      success: (res) => {
        if (res.tapIndex == 0) {
          wx.chooseImage({
            count: 3,
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
            count: 3,
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


  //采用递归的方式上传
  uploadOneByOne(imgPaths, successUp, failUp, count, length) {
    wx.uploadFile({
      url: `${app.globalData.url}system/Greetingcard/uploadImages.do`,
      filePath: imgPaths[count],
      name: `banner`,
      success: (e) => {
        let bannerList = this.data.bannerList || [];
        successUp++;
        bannerList.push(JSON.parse(e.data))
        this.setData({
          bannerList
        });
      },
      fail: (e) => {
        failUp++;
      },
      complete: (e) => {
        count++;
        if (count == length) {
          wx.showToast({
            title: '上传成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          this.uploadOneByOne(imgPaths, successUp, failUp, count, length);
        }
      }
    })
  },

  //我的贺
  getAllUserCard(index) {
    request({
      url: 'system/Greetingcard/getAllUserCard.do',
      method: 'POST',
      data: {
        openId: wx.getStorageSync('openid')
      }
    }).then(res => {
      if (res.statusCode == 200) {
        let bannerList=[]
        const userimages = res.data[index].userimages;
        for (let i in userimages){
          bannerList.push(userimages[i].v_path)
        }
        this.setData({
          cardInfo: res.data[index],
          gardenInfo: res.data[index].v_yc_schema,
          bannerList
        });
         
        wx.setNavigationBarTitle({
          title: res.data[index].v_card_name||''
        });
        this.init();
        this.initMusic()
      }
    });
  },


  // 获取音乐
  seachMusic() {
    return request({
      url: 'system/Greetingcard/seachMusic.do',
    });
  },

  // 获取动画
  seachfalsh() {
    return request({
      url: 'system/Greetingcard/seachfalsh.do',
    });
  },

  // 获取祝福
  seachzf() {
    return request({
      url: 'system/Greetingcard/seachzf.do',
    });
  },

  //海报s
  createHaiB(){
    this.setData({
      showDialogHaib: true
    });
    const context = wx.createCanvasContext('myCanvas');
    const path = this.data.cardInfo.v_coverimage_path;
    const code = this.data.cardInfo.v_coverimage_path;
    context.drawImage(path, 25, 15, 250, 300);
    context.drawImage(code, 25, 325, 100, 100);
    context.setFontSize(14);
    context.setFillStyle('gray');
    context.fillText('扫描或长按查看贺卡', 140, 375);
    context.draw();
  },
  closeDialogHaib(){
      wx.canvasToTempFilePath({
        x: 0,
        y: 50,
        width: this.data.windowWidth,
        height: this.data.contentHeight,
        canvasId: 'myCanvas',
        success: function (res) {
         savePicToAlbum(res.tempFilePath)
        }
      })
    this.setData({
      showDialogHaib: false
    });
  },
  //海报e
  chageWord() {
    let {
      avatarUrl,
      nickName,
      cardTitle,
      cardContent,
      itemIndex,
      gardenInfo
    } = this.data;
    let itemInfo = {
      avatarUrl,
      nickName,
      cardTitle,
      cardContent,
      itemIndex,
      gardenInfo
    }
    wx.navigateTo({
      url: `/pages/changeWord/changeWord?itemInfo=${JSON.stringify(itemInfo)}`
    })
  },

  selectMusic(e) {
    this.data.innerAudioContext.destroy();
    let mindex = e.currentTarget.dataset.mindex;
    console.log('mindex=' + mindex)
    this.setData({
      mindex
    });
    this.initMusic();
  },

  // 音乐s
  initMusic() {
    let {
      cardInfo,
      musicList,
      mindex
    } = this.data;
    var innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.loop = true;
    innerAudioContext.src = musicList[mindex].v_music_path;
    this.setData({
      innerAudioContext:innerAudioContext,
      v_music_path_low: cardInfo.v_music_path_low
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

  onUnload: function () {
    this.data.innerAudioContext.destroy();
  },
  // 音乐e



  //切换动画
  selectType(e) {
    const num = e.currentTarget.dataset.type;
    console.log(num)
    this.setData({
      list: [],
      num
    })
    this.init();
  },

  // 落叶s
  init() {

    let {
      num,
      list,
      count,
      animateData
    } = this.data;
    let spicLenght = animateData[num].images.length;
    let a_false_images = [];
    for (let i in animateData[num].images) {
      a_false_images.push(animateData[num].images[i].v_path_low)
    }

    for (let i = 0; i < count; i++) {
      let spicImgSrc = animateData[num].images[this.randomInteger(1, spicLenght)].v_path;
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
   // 落叶e

  //去编辑
  toEdit(e){
    // this.data.innerAudioContext.destroy();
    // const templateid = e.currentTarget.dataset.templateid;
    // wx.navigateTo({
    //   // url: `/pages/cardItem/cardItem?templateid=${templateid}`
    //   url: `/pages/changeWord/changeWord?templateid=${templateid}`
    // })
    this.selectEdit();
  },
  selectEdit() {
    this.showDialogClassify();
  },
 



  changeAnimation: function () {
    this.setData({
      showDialogClassify: false,
      showDialogType: true,
      showDialog: true
    })
  },

  showDialogClassify: function () {
    this.setData({
      showDialogClassify: true
    })
  },

  closeDialogClassify: function () {
    this.setData({
      showDialogClassify: false
    })
  },

  showDialogType: function () {
    this.setData({
      showDialogType: true
    })
  },

  closeDialogType: function () {
    this.setData({
      showDialogType: false,
      showDialog: false,
      showDialog: false
    })
  },

  showDialogMusic: function () {
    this.setData({
      showDialogMusic: true,
      showDialogClassify: false,
      showDialog: true
    })
  },

  closeDialogMusic: function () {
    this.setData({
      showDialogMusic: false,
      showDialog: false
    })
  },

  closeDialogWish: function () {
    this.setData({
      showMoreWish: false,
      showDialog: false
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
    // this.getAllUserCard(this.data.index);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
  onShareAppMessage: function (res) {
    var getById = wx.getStorageSync('getById');
    console.log('getById='+getById)
    if (res.from === 'button') { 

    }
    return {
      title: '送您一张新年祝福贺卡',
      path: '/pages/creatCard/creatCard?getById=' + getById,
      success: function (res) { }
    }
  }
})