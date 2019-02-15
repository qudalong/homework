const app = getApp();
import {
  request
} from '../../utils/request.js'
import {
  savePicToAlbum
} from '../../utils/util.js'
Page({
  data: {
    templateId: 0,
    getById: 0, //保存后返回的模板id
    headLow: '',
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
    const id = option.id || '';
    const openId = wx.getStorageSync('openid');
    const userInfo = wx.getStorageSync('userInfo');
    const templateId = option.templateId || '';
    this.setData({
      id
    })
    if (!templateId) {
      console.log("no templateId")
      const seachTempCardDetailById = this.seachTempCardDetailById(id);
      const seachMusic = this.seachMusic();
      const seachfalsh = this.seachfalsh();
      const seachzf = this.seachzf();
      Promise.all([seachTempCardDetailById, seachfalsh, seachMusic, seachzf])
        .then(res => {
          if (res.length) {
            wx.setNavigationBarTitle({
              title: res[0].data.v_template_name
            });
            this.setData({
              itemInfo: res[0].data,
              animateData: res[1].data,
              musicList: res[2].data,
              wishList: res[3].data,
              userInfo,
              openId,
              // 页面数据
              v_coverimage_path: res[0].data.v_coverimage_path,
              cardTitle: res[0].data.v_template_name,
              nickName: userInfo.nickName || '',
              avatarUrl: userInfo.avatarUrl || '',
              cardContent: res[0].data.v_blessing_content,
              v_music_path_low: res[0].data.v_music_path_low,
              v_music_path: res[0].data.v_music_path
            })
          }
          this.init();
          this.initStartMusic();
          wx.hideLoading();
        });
    } else {
      console.log("have templateId=" + templateId)
      this.setData({
        templateId
      });
      this.getAllUserCard(templateId);
    }
  },

  // 生成贺卡
  userInfoHandler_heka(e) {
    if (e.detail.userInfo) {
      wx.setStorageSync('userInfo', e.detail.userInfo);
      this.setData({
        userInfo: e.detail.userInfo,
        showbtns: true,
      });
      this.loginTag();
      if (this.data.templateId) {
        console.log('templateId=' + this.data.templateId)
        this.updateCard();
      } else {
        this.saveCard();
      }
    }
  },

  // 保存模板
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
    let bannerLista = [];
    for (let i in bannerList) {
      bannerLista.push(bannerList[i].resultPathLow)
    }
    request({
      url: 'system/Greetingcard/saveCard.do',
      method: 'POST',
      data: {
        //模板id 也就是首页模板中的id
        i_template_id: itemInfo.id,
        v_template_name: cardTitle,
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
        v_user_images: bannerLista.join(',') || '',
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
  // 保存模板
  updateCard() {
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
      a_false_images,
      templateid,
      tempData
    } = this.data;
    let v_user_images = [];
    for (let i in bannerList) {
      v_user_images.push(bannerList[i].resultPathLow)
    }
    request({
      url: 'system/Greetingcard/updateCard.do',
      method: 'POST',
      data: {
        id: templateid,
        //模板id 也就是首页模板中的id
        i_template_id: tempData.id,
        //模板模板背景
        v_coverimage_path: tempData.v_coverimage_path_low,
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
        v_wechar_path: headLow || wx.getStorageSync('userInfo').avatarUrl,
        //广告
        v_user_images: v_user_images.join(',') || '',
        // //下落的图片
        // v_false_images: a_false_images.join(',') || ''
        //下落的图片
        v_false_images: ''
      }
    }).then(res => {
      if (res.data.flag) {
        wx.setStorageSync('getById', res.data.id);
        this.setData({
          getById: res.data.id
        })
        wx.showToast({
          title: '修改成功',
        });
      }
    });
  },

  // 获取详情页
  seachTempCardDetailById(id) {
    return request({
      url: 'system/Greetingcard/seachTempCardDetailById.do',
      method: 'POST',
      data: {
        id: id
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

  //我的保存模板
  getAllUserCard(templateId) {
    request({
      url: 'system/Greetingcard/getAllUserCard.do',
      method: 'POST',
      data: {
        openId: wx.getStorageSync('openid')
      }
    }).then(res => {
      if (res.statusCode == 200) {
        for (let i in res.data) {
          if (res.data[i].id == templateId) {
            const tempData = res.data[i];
            this.setData({
              tempData,
              // 页面数据
              v_coverimage_path: tempData.v_coverimage_path,
              cardTitle: tempData.v_card_name,
              nickName: tempData.v_nc_name,
              avatarUrl: tempData.v_wechar_path,
              cardContent: tempData.v_blessing_content,
              v_music_path: tempData.v_music_path
            })
            wx.setNavigationBarTitle({
              title: this.data.cardTitle
            });
            this.initStartMusic();
          }
        }
      }
      wx.hideLoading();
    });
  },

  // 模板使用人数
  greetingcardUseScan() {
    request({
      url: 'system/Greetingcard/GreetingcardUseScan.do',
      method: 'POST',
      data: {
        i_template_id: this.data.itemInfo.id,
        v_wechar_id: this.data.openId
      }
    }).then(res => {

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
        avatarUrl: this.data.avatarUrl || e.detail.userInfo.avatarUrl,
        nickName: this.data.nickName || e.detail.userInfo.nickName
      });
      this.loginTag();
      this.selectEdit();
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
      icon: 'none'
    })
    wx.uploadFile({
      url: `${app.globalData.url}system/Greetingcard/uploadImages.do`,
      filePath: imgPaths[count],
      name: `banner`,
      success: (e) => {
        let bannerList = this.data.bannerList || [];
        successUp++;
        bannerList.push(JSON.parse(e.data));
        if (bannerList.length > 3) {
          bannerList.splice(0, bannerList.length - 3);
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
        const path = this.data.itemInfo.v_coverimage_path;
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
      fileType:'jpg',
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
        openId: wx.getStorageSync('openid'),
        v_nc_name: this.data.nickName,
        filePath: this.data.avatarUrl
      }
    }).then(res => {
      if(res.data.flag){
        this.setData({
          //绑定时返回的头像短路径
          headLow: res.data.v_wechar_image_low
        })
      }
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

  onShareAppMessage: function (res) {
    let  getById = wx.getStorageSync('getById'),
          nickName = this.data.nickName || '',
          coverImg;
    this.data.bannerList.length ? coverImg = this.data.bannerList[0].resultPath : coverImg = ''
    if (res.from === 'button') { }
    return {
      title: `【${nickName}】送您一张新年祝福贺卡`,
      imageUrl: coverImg,
      path: `/pages/creatCard/creatCard?getById=${getById}`,
      success: function (res) { }
    }
  }
})