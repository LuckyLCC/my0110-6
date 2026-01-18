"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "profile",
  setup(__props) {
    const userInfo = common_vendor.ref({
      avatar: "",
      nickname: "",
      gender: "female",
      phone: "",
      phoneMasked: "138****8888",
      birthday: "1995年01月01日"
    });
    common_vendor.onMounted(() => {
      loadUserInfo();
    });
    const loadUserInfo = async () => {
      try {
        const localUserInfo = common_vendor.index.getStorageSync("userInfo");
        if (localUserInfo) {
          updateUserInfo(localUserInfo);
        }
        const token = common_vendor.index.getStorageSync("token");
        if (token) {
          try {
            const { api } = require("@/api/request");
            const response = await api.user.getInfo();
            if (response.code === 200 && response.data) {
              updateUserInfo(response.data);
              common_vendor.index.setStorageSync("userInfo", response.data);
            }
          } catch (error) {
            common_vendor.index.__f__("log", "at pages/my/profile.vue:116", "获取用户信息失败，使用本地存储:", error);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/profile.vue:120", "加载用户信息错误:", error);
      }
    };
    const updateUserInfo = (userInfoData) => {
      if (!userInfoData)
        return;
      if (userInfoData.avatar || userInfoData.avatarUrl) {
        userInfo.value.avatar = userInfoData.avatar || userInfoData.avatarUrl;
      }
      if (userInfoData.nickname || userInfoData.name) {
        userInfo.value.nickname = userInfoData.nickname || userInfoData.name || "微信用户";
      }
      if (userInfoData.gender) {
        userInfo.value.gender = userInfoData.gender === "male" || userInfoData.gender === "男" ? "male" : "female";
      }
      if (userInfoData.phone || userInfoData.phoneNumber) {
        const phone = userInfoData.phone || userInfoData.phoneNumber;
        userInfo.value.phone = phone;
        userInfo.value.phoneMasked = maskPhone(phone);
      }
      if (userInfoData.birthday) {
        userInfo.value.birthday = formatBirthday(userInfoData.birthday);
      }
    };
    const maskPhone = (phone) => {
      if (!phone || phone.length < 11)
        return phone;
      return phone.substring(0, 3) + "****" + phone.substring(7);
    };
    const formatBirthday = (birthday) => {
      if (!birthday)
        return "1995年01月01日";
      const date = new Date(birthday);
      if (isNaN(date.getTime()))
        return birthday;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}年${month}月${day}日`;
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const changeAvatar = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          userInfo.value.avatar = res.tempFilePaths[0];
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/my/profile.vue:178", "选择头像失败:", err);
        }
      });
    };
    const editNickname = () => {
      common_vendor.index.showModal({
        title: "修改昵称",
        editable: true,
        placeholderText: "请输入昵称",
        success: (res) => {
          if (res.confirm && res.content) {
            userInfo.value.nickname = res.content;
          }
        }
      });
    };
    const selectGender = (gender) => {
      userInfo.value.gender = gender;
    };
    const editPhone = () => {
      common_vendor.index.showToast({
        title: "手机号修改功能开发中",
        icon: "none"
      });
    };
    const selectBirthday = () => {
      common_vendor.index.showModal({
        title: "选择生日",
        editable: true,
        placeholderText: "请输入生日，格式：1995年01月01日",
        success: (res) => {
          if (res.confirm && res.content) {
            const datePattern = /^\d{4}年\d{2}月\d{2}日$/;
            if (datePattern.test(res.content)) {
              userInfo.value.birthday = res.content;
            } else {
              common_vendor.index.showToast({
                title: "日期格式不正确",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const saveChanges = async () => {
      try {
        const token = common_vendor.index.getStorageSync("token");
        if (token) {
          const currentUserInfo = common_vendor.index.getStorageSync("userInfo") || {};
          const updateData = {
            nickname: userInfo.value.nickname,
            gender: userInfo.value.gender,
            phone: userInfo.value.phone,
            birthday: userInfo.value.birthday
          };
          const updatedUserInfo = {
            ...currentUserInfo,
            ...updateData
          };
          common_vendor.index.setStorageSync("userInfo", updatedUserInfo);
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/profile.vue:256", "保存用户信息错误:", error);
      }
    };
    const logout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_vendor.o(goBack),
        c: userInfo.value.avatar || "/static/profile/avatar.png",
        d: common_vendor.o(changeAvatar),
        e: common_vendor.t(userInfo.value.nickname || "微信用户"),
        f: common_vendor.o(editNickname),
        g: userInfo.value.gender === "male"
      }, userInfo.value.gender === "male" ? {
        h: common_assets._imports_1
      } : {}, {
        i: userInfo.value.gender === "male" ? 1 : "",
        j: common_vendor.o(($event) => selectGender("male")),
        k: userInfo.value.gender === "female"
      }, userInfo.value.gender === "female" ? {
        l: common_assets._imports_1
      } : {}, {
        m: userInfo.value.gender === "female" ? 1 : "",
        n: common_vendor.o(($event) => selectGender("female")),
        o: common_vendor.t(userInfo.value.phoneMasked || "138****8888"),
        p: common_vendor.o(editPhone),
        q: common_vendor.t(userInfo.value.birthday || "1995年01月01日"),
        r: common_vendor.o(selectBirthday),
        s: common_vendor.o(saveChanges),
        t: common_vendor.o(logout)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-daa3bc30"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/profile.js.map
