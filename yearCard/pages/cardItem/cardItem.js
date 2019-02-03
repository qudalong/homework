const app = getApp();
import {
  request
} from '../../utils/request.js'
import {
  savePicToAlbum
} from '../../utils/util.js'
Page({
  data: {
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
 
  onLoad: function(option) {
    wx.showLoading({
      title: '加载中...',
    })
    const userInfo = wx.getStorageSync('userInfo');
    let itemIndex = option.itemIndex || ''; //从首页跳过来传的模板下标
    const templateid = option.templateid || ''; //从我的贺卡跳过来传的模板id
    const seachTempCard = this.seachTempCard();
    const seachMusic = this.seachMusic();
    const seachfalsh = this.seachfalsh();
    const seachzf = this.seachzf();
    this.setData({
      itemIndex
    });
    Promise.all([seachTempCard, seachfalsh, seachMusic, seachzf])
      .then(res => {
        const allData = res[0].data;
        // 根据id查找下表
        if (templateid) {
          for (let i in allData) {
            if (allData[i].id == templateid) {
              this.setData({
                itemIndex: i
              })
            }
          }
        }
        let cardTitle = res[0].data[this.data.itemIndex].v_template_name || '';
        this.setData({
          itemInfo: res[0].data[this.data.itemIndex],
          animateData: res[1].data,
          musicList: res[2].data,
          wishList: res[3].data,
          userInfo,
          itemIndex,
          // 页面数据
          cardTitle,
          nickName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
          cardContent: res[0].data[this.data.itemIndex].v_blessing_content,
          v_coverimage_path: res[0].data[this.data.itemIndex].v_coverimage_path,

          openId: wx.getStorageSync('openid'),
          v_nc_name: wx.getStorageSync('userInfo').nickName,
          filePath: wx.getStorageSync('userInfo').avatarUrl
        });
        // 初始化数据
        this.init();
        // this.initStartMusic();
        this.initStartMusic();
        wx.setNavigationBarTitle({
          title: cardTitle
        });
        wx.hideLoading();
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
        // v_wechar_path: headLow,
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
        this.greetingcardUseScan();
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


  // 模板使用人数
  greetingcardUseScan() {
    request({
      url: 'system/Greetingcard/GreetingcardUseScan.do',
      method: 'POST',
      data: {
        i_template_id: this.data.itemInfo.id,
        v_wechar_id: wx.getStorageSync('openid')
      }
    }).then(res => {

    });
  },

  //音乐
  initStartMusic() {
    let {
      v_music_path_low,
    } = this.data;

    var innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.loop = true;
    innerAudioContext.src = this.data.itemInfo.v_music_path;
    //console.log(this.data.itemInfo.v_music_path)
    this.setData({
      innerAudioContext,
      v_music_path_low: v_music_path_low
    });
  },

  initMusic() {
    let {
      itemInfo,
      musicList,
      mindex,
    } = this.data;

    let innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.loop = true;
    innerAudioContext.src = musicList[mindex].v_music_path;
    this.setData({
      innerAudioContext,
      v_music_path_low: musicList[mindex].v_music_path_low
    });
  },

  //切换音乐
  selectMusic(e) {
    this.data.innerAudioContext.destroy();
    let mindex = e.currentTarget.dataset.mindex;
    //console.log('mindex=' + mindex)
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

  selectEdit() {
    this.showDialogClassify();
  },


  userInfoHandler(e) {
    if (e.detail.userInfo) {
      wx.setStorageSync('userInfo', e.detail.userInfo);
      this.setData({
        userInfo: e.detail.userInfo,
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName
      });
      this.loginTag();
      this.selectEdit();
    }
  },
  userInfoHandler_heka(e) {
    if (e.detail.userInfo) {
      wx.setStorageSync('userInfo', e.detail.userInfo);
      this.setData({
        userInfo: e.detail.userInfo,
        // avatarUrl: e.detail.userInfo.avatarUrl,
        // nickName: e.detail.userInfo.nickName,
      showbtns: true,
      });
      this.loginTag();
      this.saveCard();
    }
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
    wx.showLoading({
      title: '上传中...',
      icon:'none'
    })
    wx.uploadFile({
      url: `${app.globalData.url}system/Greetingcard/uploadImages.do`,
      filePath: imgPaths[count],
      name: `banner`,
      success: (e) => {
        let bannerList = this.data.bannerList || [];
        successUp++;
        bannerList.push(JSON.parse(e.data));
        if (bannerList.length>3){
          bannerList.splice(0, bannerList.length-3);
        }
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
          wx.hideLoading();
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
    const context = wx.createCanvasContext('myCanvas');
    const path = this.data.itemInfo.v_coverimage_path;
    const code = this.data.itemInfo.v_coverimage_path;
    context.drawImage(path, 25, 15, 250, 300);
    context.drawImage(code, 25, 325, 100, 100);
    context.setFontSize(14);
    context.setFillStyle('gray');
    context.fillText('扫描或长按查看贺卡', 140, 375);
    context.draw();
  },


  //海报s


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
    })
    this.setData({
      showDialogHaib: false
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
          infos: res.data.info
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
      console.log(res)
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
  onShareAppMessage: function(res) {
    let getById = wx.getStorageSync('getById');
    //console.log(getById)
    if (res.from === 'button') {}
    return {
      title: '送您一张新年祝福贺卡',
      path: '/pages/creatCard/creatCard?getById=' + getById,
      success: function(res) {}
    }
  }
})