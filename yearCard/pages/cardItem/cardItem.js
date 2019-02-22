const app = getApp();
import {
  request
} from '../../utils/request.js'
import {
  savePicToAlbum,
  drawImage
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

  onLoad: function(options) {
    // wx.hideShareMenu();
    wx.showLoading({
      title: '加载中...',
    })
    const id = options.id || ''; //模板id
    const openId = wx.getStorageSync('openid');
    const userInfo = wx.getStorageSync('userInfo');
    const templateId = options.templateId || ''; //卡片id

    this.setData({
      id,
      templateId
    })
    const seachMusic = this.seachMusic();
    const seachfalsh = this.seachfalsh();
    const seachzf = this.seachzf();
   
    if (!templateId) {
      console.log('-------这将是保存操作-------')
      const seachTempCardDetailById = this.seachTempCardDetailById(id);
      Promise.all([seachTempCardDetailById, seachfalsh, seachMusic, seachzf])
        .then(res => {
          if (res.length) {
            wx.setNavigationBarTitle({
              title: res[0].data.v_template_name
            });
            // 查找音乐序号
            for (let i in res[2].data) {
              if (res[2].data[i].v_music_path_low == res[0].data.v_music_path_low) {
                this.setData({
                  mindex: i
                })
              }
            }
            this.setData({
              itemInfo: res[0].data,
              animateData: res[1].data,
              musicList: res[2].data,
              wishList: res[3].data,
              userInfo,
              openId,
              // 页面数据
              v_bg_color: res[0].data.v_bg_color || '#fff',
              v_coverimage_path: res[0].data.v_coverimage_path,
              v_coverimage_path_low: res[0].data.v_coverimage_path_low,
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
     // this.data.innerAudioContext.destroy();
      console.log('-------这将是update操作-------')
      // 修改时
      this.setData({
        templateId
      });
      Promise.all([seachfalsh, seachMusic, seachzf]).then(res => {
        if (res.length) {
          this.setData({
            animateData: res[0].data,
            musicList: res[1].data,
            wishList: res[2].data
          })
        }
      })
      //修改时查询接口
      this.getUserCardById(templateId);
    }
    //模板浏览次(进入详情时)
    this.greetcardScanScan();
  },

  //模板浏览次
  greetcardScanScan() {
    request({
      url: 'system/Greetingcard/GreetcardScanScan.do',
      method: 'POST',
      data: {
        i_template_id: this.data.id,
        v_wechar_id: wx.getStorageSync('openid')
      }
    }).then(res => {});
  },



  //我的贺卡详情(修改时信息数据)
  getUserCardById(id) {
    request({
      url: 'system/Greetingcard/getUserCardById.do',
      method: 'POST',
      data: {
        id: id
      }
    }).then(res => {
      if (res.statusCode == 200) {
        if (res.data) {
          const tempData = res.data;
          wx.setNavigationBarTitle({
            title: tempData.v_card_name
          });

          let bannerList = [];
          let a_false_images = [];
          let v_user_images = [];
          const userimages = tempData.userimages;
          const flashimages = tempData.flashimages;
          if (userimages.length) {
            for (let i in userimages) {
              bannerList.push(userimages[i].v_path);
              v_user_images.push(flashimages[i].v_path_low)
            }
          }
          if (flashimages.length) {
            for (let i in flashimages) {
              a_false_images.push(flashimages[i].v_path_low)
            }
          }

          this.setData({
            tempData,
            v_user_images: v_user_images,
            a_false_images: a_false_images,
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
        this.initUpate();
        if (this.data.innerAudioContext) {
          this.data.innerAudioContext.destroy();
        } 
        this.initStartMusic();
        // 查找音乐序号
        for (let i in this.data.musicList) {
          if (this.data.musicList[i].v_music_path == this.data.tempData.v_music_path) {
            this.setData({
              mindex: i
            })
          }
        }
        // 查找动画序号
        for (let i in this.data.animateData) {
          for (let j in this.data.flashimages) {
            if (this.data.animateData[i].images[0].v_path_low == this.data.flashimages[j].v_path_low) {
              this.setData({
                num: i
              })
            }
          }
        }
        wx.hideLoading();
      }
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
        this.updateCard();
      } else {
        this.saveCard();
      }
    }
  },



  // 保存模板
  saveCard() {
    let {
      id,
      nickName,
      headLow,
      itemInfo,
      cardTitle,
      cardContent,
      v_music_path_low,
      v_coverimage_path_low,
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
        i_template_id: id,
        v_template_name: cardTitle,
        //模板模板背景
        v_coverimage_path: v_coverimage_path_low,
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

  //保存模板(点击生成贺卡时)
  greetingcardUseScan() {
    request({
      url: 'system/Greetingcard/GreetingcardUseScan.do',
      method: 'POST',
      data: {
        i_template_id: this.data.id,
        v_wechar_id: wx.getStorageSync('openid')
      }
    }).then(res => {});
  },

  // 保存模板
  updateCard() {
    let {
      id,
      nickName,
      headLow,
      itemInfo,
      cardTitle,
      cardContent,
      v_music_path_low,
      gardenInfo,
      itemIndex,
      templateid,
      v_user_images,
      bannerList,
      a_false_images,
      tempData
    } = this.data;
    request({
      url: 'system/Greetingcard/updateCard.do',
      method: 'POST',
      data: {
        id: tempData.id,
        i_template_id: tempData.i_template_id,
        v_template_name: tempData.v_card_name,
        v_coverimage_path: tempData.v_coverimage_path_low,
        v_phone: '18768871893',
        v_nc_name: nickName || tempData.v_nc_name,
        v_card_name: cardTitle || tempData.v_card_name,
        v_blessing_content: cardContent || tempData.v_blessing_content,
        v_yc_schema: gardenInfo || tempData.v_yc_schema,
        v_music_path: v_music_path_low || tempData.v_music_path_low,
        v_wechar_id: wx.getStorageSync('openid'),
        v_wechar_path: headLow || tempData.v_wechar_path_low,
        v_user_images: bannerList.join(',') || v_user_images.join(',') || '',
        v_false_images: a_false_images.join(',')
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

  chageWord() {
    let {
      avatarUrl,
      nickName,
      cardTitle,
      cardContent,
      itemIndex,
      gardenInfo,
      templateId
    } = this.data;
    let itemInfo = {
      avatarUrl,
      nickName,
      cardTitle,
      cardContent,
      itemIndex,
      gardenInfo,
      templateId
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
    this.data.innerAudioContext.destroy();
    let {
      itemInfo,
      musicList,
      mindex
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
    if (animateData[num].images.length) {
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
    }
  },

  // 落叶s
  initUpate() {
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
        list
      })
    }
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

  toOutpage() {
    wx.navigateTo({
      url: '/pages/outpage/outpage',
    })
  },

  // 删除广告图片
  deleteBannerImg(e) {
    const curBannerIndex = e.currentTarget.dataset.index;
    let {
      bannerList,
      v_user_images
    } = this.data;
    bannerList.splice(curBannerIndex, 1);
    if (v_user_images.length) {
      v_user_images.splice(curBannerIndex, 1);
    }
    this.setData({
      bannerList,
      v_user_images
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
        let v_user_images = this.data.v_user_images || [];
        successUp++;
        bannerList.push(JSON.parse(e.data));
        v_user_images.push(JSON.parse(e.data).resultPathLow);
        if (bannerList.length > 9) {
          bannerList.splice(0, bannerList.length - 9);
        }
        if (v_user_images.length > 9) {
          v_user_images.splice(0, v_user_images.length - 9);
        }
        this.setData({
          bannerList,
          v_user_images
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
          });
          this.initStartMusic();
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
    let card_id;
    this.data.templateId ? card_id = this.data.templateId : card_id = this.data.getById
    // 获取二维码
    return request({
      url: 'system/Greetingcard/getSunpath.do',
      method: 'POST',
      data: {
        card_id: card_id
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
    // if (!this.data.nickName){
    //   return
    // }
    // if (!this.data.avatarUrl){
    //   return
    // }
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

  onUnload: function() {
    this.data.innerAudioContext.destroy();
    if (this.data.templateId) {
      this.data.innerAudioContext.destroy();
      wx.navigateBack({
        delta: 2
      })
    }
  },
  onShow() {
    wx.setNavigationBarTitle({
      title: this.data.cardTitle
    });
    //修改时查询接口
    // if (this.data.templateId) {
    //   this.getUserCardById(this.data.templateId);
    // }

    const seachMusic = this.seachMusic();
    const seachfalsh = this.seachfalsh();
    const seachzf = this.seachzf();
    Promise.all([seachfalsh, seachMusic, seachzf])
      .then(res => {
        if (res.length) {
          this.setData({
            animateData: res[0].data,
            musicList: res[1].data,
            wishList: res[2].data,
            //为生成朋友圈图片用
            itemInfo: {
              v_coverimage_path: this.data.v_coverimage_path
            }
          })
        }
        wx.hideLoading();
      });
  },

  //模板分享
  greetcardShareScan() {
    request({
      url: 'system/Greetingcard/GreetcardShareScan.do',
      method: 'POST',
      data: {
        i_template_id: this.data.id,
        v_wechar_id: wx.getStorageSync('openid')
      }
    }).then(res => {});
  },

  onShareAppMessage: function(res) {
    let getById = this.data.getById||wx.getStorageSync('getById'),
      openid = wx.getStorageSync('openid'),
      nickName = this.data.nickName || '',
      coverImg;
    if (getById == 'undefined' || getById == '') {
      wx.showToast({
        title: '您还未保存生成贺卡哦，还不能分享',
        icon: 'none'
      });
      return
    }

    this.data.bannerList.length ? coverImg = this.data.bannerList[0].resultPath : coverImg = ''
    if (res.from === 'button') {
      //模板分享人数统计
      this.greetcardShareScan();
      this.stopMusic();
      console.log('将要分享的卡片id_接口=' + this.data.getById)
      console.log('将要分享的卡片id=' + getById)
    }
    return {
      title: `【${nickName}】送您一张祝福贺卡`,
      imageUrl: coverImg,
      path: `/pages/creatCard/creatCard?getById=${getById}&openid=${openid}`,
      success: function(res) {}
    }

  }
})