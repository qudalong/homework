import {
  request
} from '../../utils/request.js'
Page({
  data: {
    sendOready:false,
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
    animateData: []
  },

  onLoad: function(option) {
    wx.showLoading({
      title: '加载中...'
    })
    const userInfo = wx.getStorageSync('userInfo');
    const tempId = option.tempId || ''; //从我的贺卡跳过来传的模板id
    const itemIndex = option.itemIndex || ''; //
    const getById = option.getById || ''; //获取数据的id
    const seachTempCard = this.seachTempCard();
    const seachMusic = this.seachMusic();
    const seachfalsh = this.seachfalsh();
    const seachzf = this.seachzf();
    this.initsendButton();
    this.setData({
      getById: getById
    })
    this.greetingcardScanU();

    //获取保存后的模板数据
    this.getUserCardById();
  },

  getUserCardById() {
    request({
      url: 'system/Greetingcard/getUserCardById.do',
      method: 'POST',
      data: {
        id: this.data.getById
      }
    }).then(res => {
      let bannerList = []
      const userimages = res.data.userimages;
      for (let i in userimages) {
        bannerList.push(userimages[i].v_path)
      }
      var avatarUrl = res.data.v_wechar_path;
      if (avatarUrl){
        if (avatarUrl.indexOf('greetcard')==-1) {
          avatarUrl = res.data.v_wechar_path_low;
        }
      }

      this.setData({
        cardInfo: res.data,
        itemInfo: res.data,
        v_coverimage_path: res.data.v_coverimage_path,
        v_music_path: res.data.v_music_path,
        cardTitle: res.data.v_card_name,
        avatarUrl: avatarUrl,
        nickName: res.data.v_nc_name,
        cardContent: res.data.v_blessing_content,
        bannerList,
        gardenInfo: res.data.v_yc_schema,
      })
      this.init();
      this.initMusic();
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
        v_wechar_path: headLow,
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

  // 获取模板
  seachTempCard() {
    return request({
      url: 'system/Greetingcard/seachTempCard.do',
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

  //音乐
  initMusic() {
    let {
      itemInfo,
      musicList,
      mindex
    } = this.data;

    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.loop = true;
    innerAudioContext.src = itemInfo.v_music_path;
    this.setData({
      innerAudioContext
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
    // for (let i in animateData[num].images) {
    //   a_false_images.push(animateData[num].images[i].v_path_low)
    // }
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


  // 删除广告图片
  deleteBannerImg(e) {
    const curBannerIndex = e.currentTarget.dataset.index;
    let {
      bannerList
    } = this.data;
    bannerList.splice(curBannerIndex, 1);
    this.setData({
      bannerList
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
  },
  closeDialogHaib() {

    // var context = wx.createCanvasContext('myCanvas');
    // var path = '/image/img/banner.jpg';
    // var code = '/image/img/code.jpg';
    // //这个地方的图片是需要注意，图片需要下载不然，手机上不能正常显示
    // context.drawImage(path, 25, 15, 250, 350);
    // context.drawImage(code, 25, 375, 100, 100);
    // context.setFontSize(14);
    // context.setFillStyle('gray');
    // context.fillText('扫描或长按查看贺卡', 140, 435);


    this.setData({
      showDialogHaib: false
    });
  },


  onUnload: function() {
    this.data.innerAudioContext.destroy();
  },

  onShow() {
    wx.setNavigationBarTitle({
      title: this.data.cardTitle
    });
  },


  toHome(){
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
          messageList: res.data
        })
    });
  },




  // 送花
  sendFlow() {
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
        this.getFlowBycardId();
      }
    });
  },


  // 模板查看人数
  greetingcardScanU() {
    request({
      url: 'system/Greetingcard/GreetingcardScanU.do',
      method: 'POST',
      data: {
        i_card_id: this.data.getById,
        v_wechar_id: wx.getStorageSync('openid') || ''
      }
    }).then(res => {
      
    });
  },


   initsendButton:function(){
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
          bangding:true
        })
        this.bingwecharUser();
      }else{
        this.setData({
          bangding:false
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
      console.log(res)
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
    if (!this.data.zufu){
      wx.showToast({
        title: '祝福不能为空',
        icon:'none'
      })
      return
    }
    request({
      url: 'system/Greetingcard/sendMessage.do',
      method: 'POST',
      data: {
        id: this.data.getById, //卡片id
        v_wechar_id: wx.getStorageSync('openid'), // 谁送的
        v_nc: this.data.nicheng || wx.getStorageSync('userInfo').nickName||'',
        v_content: this.data.zufu
      }
    }).then(res => {
      this.getMessageBycardId();
    });
    this.setData({
      flowerDialog: false
    })
  },

  onShareAppMessage: function (res) {
    let getById = this.data.getById;
    if (res.from === 'button') {
    }
    return {
      title: '送您一张新年祝福贺卡',
      path: '/pages/creatCard/creatCard?getById=' + getById,
      success: function (res) { }
    }
  }
})