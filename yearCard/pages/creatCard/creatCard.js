import {
  request
} from '../../utils/request.js'
import {
  savePicToAlbum, drawImage
} from '../../utils/util.js'
Page({
  data: {
    sendOready: false,
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
    num: 1, //动画序号
    autoplay: true, //音乐默认播放
    list: [], //小图片集合
    count: 30,
    showCreateHaib: false,
    showDialog: false,
    showDialogClassify: false,
    showDialogMusic: false,
    showDialogType: false,
    showMoreWish: false,
    showDialogWord: false,
    wishList: [], //祝福语
    bannerList: [], //广告图片集合
    musicList: [],
    animateData: [],
    timer:null
  },

  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...'
    })
    const userInfo = wx.getStorageSync('userInfo');
    const openid = options.openid||'';//分享时带过来的为了验证是不是自己打开
    const itemIndex = options.itemIndex || ''; //
    const getById = options.getById || decodeURIComponent(options.scene) ||'431' ; //获取数据的id
    const seachMusic = this.seachMusic();
    const seachfalsh = this.seachfalsh();
    const seachzf = this.seachzf();
    this.initsendButton();

    console.log('getById=' + getById)
    console.log('通过二维码进入scene=' + decodeURIComponent(options.scene))

    this.setData({
      getById: getById,
      openid
    })
  
    //获取保存后的模板数据
    this.getUserCardById();
    //获取评论消息列表
    this.getMessageBycardId();
    //获取送花列表
    this.getFlowBycardId();
    //贺卡浏览人/次
    this.greetingcardScanU();
  },

  //贺卡浏览人/次
  greetingcardScanU() {
    request({
      url: 'system/Greetingcard/GreetingcardScanU.do',
      method: 'POST',
      data: {
        i_card_id: this.data.getById,
        v_wechar_id: wx.getStorageSync('openid')
      }
    }).then(res => { });
  },

  //贺卡分享人
  greetingcardScanShareU() {
    request({
      url: 'system/Greetingcard/GreetingcardScanShareU.do',
      method: 'POST',
      data: {
        i_card_id: this.data.getById,
        v_wechar_id: wx.getStorageSync('openid')
      }
    }).then(res => { });
  },

  getUserCardById() {
    request({
      url: 'system/Greetingcard/getUserCardById.do',
      method: 'POST',
      data: {
        id: this.data.getById
      }
    }).then(res => {
      console.log('获取模板数据的id=' + this.data.getById)
      let innerAudioContext = wx.createInnerAudioContext();
      innerAudioContext.autoplay = true;
      innerAudioContext.loop = true;
      innerAudioContext.src = res.data.v_music_path;

      let bannerList = []
      const userimages = res.data.userimages;
      for (let i in userimages) {
        bannerList.push(userimages[i].v_path)
      }
      var avatarUrl = res.data.v_wechar_path;
      if (avatarUrl) {
        if (avatarUrl.indexOf('greetcard') == -1) {
          avatarUrl = res.data.v_wechar_path_low;
        }
      }
      this.setData({
        cardInfo: res.data,
        itemInfo: res.data,
        getById: res.data.id,
        v_coverimage_path: res.data.v_coverimage_path,
        v_music_path: res.data.v_music_path,
        cardTitle: res.data.v_card_name,
        avatarUrl: res.data.v_wechar_path || avatarUrl,
        nickName: res.data.v_nc || res.data.v_nc_name || nickName,
        cardContent: res.data.v_blessing_content,
        bannerList,
        gardenInfo: res.data.v_yc_schema,
        innerAudioContext
      })
      this.init();
      wx.setNavigationBarTitle({
        title: res.data.v_card_name
      });
      wx.hideLoading();
    });
  },
  toCreateCard: function() {
    this.saveCard();
    this.setData({
      showCreateHaib: true
    });
  },

  // 获取模板
  saveCard() {
    let {
      nickName,
      headLow,
      itemInfo,
      cardTitle,
      cardContent,
      v_music_path_low,
      gardenInfo,
      bannerList,
      itemIndex,
      a_false_images
    } = this.data;
    let v_user_images = [];
    for (let i in bannerList) {
      v_user_images.push(bannerList[i].resultPathLow)
    }
    request({
      url: 'system/Greetingcard/saveCard.do',
      method: 'POST',
      data: {
        //模板id 也就是首页模板中的id
        i_template_id: itemInfo.id,
        //模板模板背景
        v_coverimage_path: itemInfo.v_coverimage_path_low,
        //用户电话
        v_phone: '18768871893',
        //昵称
        v_nc_name: nickName,
        //卡片标题
        v_card_name: cardTitle,
        //祝福语
        v_blessing_content: cardContent,
        //园所简介
        v_yc_schema: gardenInfo || '',
        //音乐路径
        v_music_path: v_music_path_low,
        //微信唯一标识
        v_wechar_id: wx.getStorageSync('openid'),
        //微信头像 路径
        // v_wechar_path: avatarUrl,
        v_wechar_path: headLow || wx.getStorageSync('userInfo').avatarUrl,
        //用户自定义上传的照片 多个已逗号隔开
        v_user_images: v_user_images.join(',') || '',
        v_false_images: a_false_images.join(',') || ''
      }
    }).then(res => {
      if (res.data.flag) {
        wx.setStorageSync('getById', res.data.id);
        this.setData({
          getById: res.data.id
        })
        wx.showToast({
          title: '保存成功',
        });
      }
    });
  },

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

  //切换音乐
  selectMusic(e) {
    this.data.innerAudioContext.destroy();
    const mindex = e.currentTarget.dataset.mindex;
    this.setData({
      mindex
    });
    this.initMusic();
  },

  //切换动画
  selectType(e) {
    const num = e.currentTarget.dataset.type;
    this.setData({
      list: [],
      num
    })
    this.init();
  },

  init() {
    let {
      itemInfo,
      num,
      list,
      count,
      animateData
    } = this.data;
    let spicLenght = itemInfo.flashimages.length;
    let a_false_images = [];
    let spicImgSrc = itemInfo.flashimages[this.randomInteger(1, spicLenght)].v_path;
    for (let i = 0; i < count; i++) {
      let spicImgSrc = itemInfo.flashimages[this.randomInteger(1, spicLenght)].v_path;
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

  selectEdit() {
    this.showDialogClassify();
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

  // 传照片
  uploadImg: function() {
    wx.showActionSheet({
      itemList: ['拍照', '从手机相册选择'],
      success: (res) => {
        if (res.tapIndex == 0) {
          wx.chooseImage({
            count: 9,
            sizeType: ['compressed'],
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
            count: 9,
            sizeType: ['compressed'],
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

  changeAnimation: function() {
    this.setData({
      showDialogClassify: false,
      showDialogType: true,
      showDialog: true
    })
  },

  showDialogClassify: function() {
    this.setData({
      showDialogClassify: true
    })
  },

  closeDialogClassify: function() {
    this.setData({
      showDialogClassify: false
    })
  },

  showDialogType: function() {
    this.setData({
      showDialogType: true
    })
  },

  closeDialogType: function() {
    this.setData({
      showDialogType: false,
      showDialog: false,
      showDialog: false
    })
  },

  showDialogMusic: function() {
    this.setData({
      showDialogMusic: true,
      showDialogClassify: false,
      showDialog: true
    })
  },

  closeDialogMusic: function() {
    this.setData({
      showDialogMusic: false,
      showDialog: false
    })
  },

  closeDialogWish: function() {
    this.setData({
      showMoreWish: false,
      showDialog: false
    })
  },

  showDialogHaib() {
    this.setData({
      showDialogHaib: true
    });
    wx.showLoading({
      title: '努力生成中...'
    });
    // 获取二维码
    return request({
      url: 'system/Greetingcard/getSunpath.do',
      method: 'POST',
      data: {
        card_id: this.data.getById
      }
    }).then(res => {
      if (res.data.filePath) {
        const coverPath = this.data.v_coverimage_path;
        const codePath = res.data.filePath;
        wx.downloadFile({
          url: coverPath,
          success: (res) => {
            const coverPath_canvas = res.tempFilePath
            wx.downloadFile({
              url: codePath,
              success: (res) => {
                const codePath_canvas = res.tempFilePath
                drawImage(coverPath_canvas, codePath_canvas)
              }
            });
          }
        });
      }
    });
  },
  closeDialogHaib() {
    wx.canvasToTempFilePath({
      x: 0,
      y: 50,
      width: this.data.windowWidth,
      height: this.data.contentHeight,
      canvasId: 'myCanvas',
      success: function(res) {
        savePicToAlbum(res.tempFilePath)
      }
    });
    this.setData({
      showDialogHaib: false
    });
  },

  onUnload: function() {
    this.data.innerAudioContext.destroy();
    // clearInterval(this.data.timer);
  },

  onShow() {
    wx.setNavigationBarTitle({
      title: this.data.cardTitle
    });
  },

  toHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  closeFloweDalog() {
    this.setData({
      flowerDialog: false
    })
  },
  returnF() {
    this.setData({
      flowerDialog: true
    })
  },
  sendZF() {
    this.setData({
      flowerDialog: true
    })
  },
  chInput(e) {
    this.setData({
      nicheng: e.detail.value
    })
  },
  zhInput(e) {
    this.setData({
      zufu: e.detail.value
    })
  },

  // 获取小红花消息
  getFlowBycardId() {
    request({
      url: 'system/Greetingcard/getFlowBycardId.do',
      method: 'POST',
      data: {
        id: this.data.getById //卡片id
      }
    }).then(res => {
      this.setData({
        flowerList: res.data
      })
    });
  },

  // 获取消息
  getMessageBycardId() {
    request({
      url: 'system/Greetingcard/getMessageBycardId.do',
      method: 'POST',
      data: {
        id: this.data.getById //卡片id
      }
    }).then(res => {
      this.setData({
        messageList: res.data,
      })
    });
  },

  // 送花
  sendFlow() {
    if (this.data.openid == wx.getStorageSync('openid')){
      wx.showToast({
        title: '自己不能给自己送花哦',
        icon: 'none'
      });
      return;
    }
    if (this.data.sendOready) {
      wx.showToast({
        title: '您已经送过了哦！',
        icon: 'none'
      });
      return;
    }
  
    request({
      url: 'system/Greetingcard/sendFlow.do',
      method: 'POST',
      data: {
        id: this.data.getById, //卡片id
        v_wechar_id: wx.getStorageSync('openid'), // 谁送的
      }
    }).then(res => { 
      if (!res.data.flag) {
        this.setData({
          sendOready: true
        })
      }
        wx.showToast({
          title: '送花成功！',
          icon: 'none'
        });
      this.getFlowBycardId();
    });
  },


  initsendButton: function() {
    request({
      url: 'system/Greetingcard/loginTag.do',
      method: 'POST',
      data: {
        openId: wx.getStorageSync('openid')
      }
    }).then(res => {
      if (!res.data.flag) {
        this.setData({
          bangding: true
        })

      } else {
        this.setData({
          bangding: false
        })
      }
    });
  },

  // 验证有无绑定
  loginTag() {
    request({
      url: 'system/Greetingcard/loginTag.do',
      method: 'POST',
      data: {
        openId: wx.getStorageSync('openid')
      }
    }).then(res => {
      if (!res.data.flag) {
        this.setData({
          bangding: true
        })
        this.bingwecharUser();
      } else {
        this.setData({
          bangding: false,
          headLow: res.data.info.v_wechar_image_low
        })
      }
    });
  },

  //绑定
  bingwecharUser() {
    this.setData({
      bangding: false
    })
    request({
      url: 'system/Greetingcard/bingwecharUser.do',
      method: 'POST',
      data: {
        openId: wx.getStorageSync('openid'),
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

  userInfoHandler(e) {
    if (e.detail.userInfo) {
      wx.setStorageSync('userInfo', e.detail.userInfo);
      this.setData({
        userInfo: e.detail.userInfo,
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName
      });
    }
    this.loginTag();
  },

  //发祝福
  sendMessage() {
    if (!this.data.zufu) {
      wx.showToast({
        title: '祝福不能为空',
        icon: 'none'
      })
      return
    }
    request({
      url: 'system/Greetingcard/sendMessage.do',
      method: 'POST',
      data: {
        id: this.data.getById, //卡片id
        v_wechar_id: wx.getStorageSync('openid'), // 谁送的
        v_nc: this.data.nicheng || wx.getStorageSync('userInfo').nickName || '',
        v_content: this.data.zufu
      }
    }).then(res => {
      wx.showToast({
        title: '祝福成功！',
        icon: 'none'
      });
      this.getMessageBycardId();
    });
    this.setData({
      flowerDialog: false
    })
  },
  toTycz() {
    wx.navigateToMiniProgram({
      appId: 'wxa9e3302fab960815',
      path: 'pages/login/userLogin/userLogin',
      extraData: {},
      success(res) { }
    })
  },
  toOutpage(){
    wx.navigateTo({
      url: '/pages/outpage/outpage',
    })
  },

 
  onShareAppMessage: function(res) {
    let getById = this.data.getById||wx.getStorageSync('getById'),
      openid = wx.getStorageSync('openid'),
      nickName = this.data.nickName || '',
      coverImg;
    this.data.bannerList.length ? coverImg = this.data.bannerList[0] : coverImg = '';
    if (res.from === 'button') {
      this.greetingcardScanShareU();
      this.stopMusic();
      console.log('将要分享的卡片id_接口=' + this.data.getById)
      console.log('将要分享的卡片id=' + getById)
    }
    return {
      title: `【${nickName}】送您一张祝福贺卡`,
      imageUrl: coverImg,
      path: `/pages/creatCard/creatCard?getById=${getById}&openid=${openid}`,
      success: function(res) {
      }
    }
  }
})