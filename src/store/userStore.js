import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabaseClient';

const useUserStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      userInfo: {
        id: null, // 用户ID
        username: '',
        email: '',
        avatar: '👤',
        joinDate: '',
        level: '普通用户',
        points: 0,
        parentInviteCode: '', // 父邀请码
        myInviteCode: '', // 自己的邀请码
        binanceUID: '', // 币安UID
        bitgetUID: '', // bitget UID
        wechat: '', // 微信号
        okxUID: '', // OKX UID
        is_verified: false, // 是否已验证
        user_type: '普通用户', // 用户类型
        premium_days: 0, // 高级会员剩余天数
      },

      // 登录（由 fetchUserByUsername 完成数据获取，这里只设标记）
      login: async (username) => {
        await get().fetchUserByUsername(username);
      },

      // 登出
      logout: () => {
        set({
          isLoggedIn: false,
          userInfo: {
            id: null,
            username: '',
            email: '',
            avatar: '👤',
            joinDate: '',
            level: '普通用户',
            points: 0,
            parentInviteCode: '',
            myInviteCode: '',
            binanceUID: '',
            bitgetUID: '',
            wechat: '',
            okxUID: '',
            is_verified: false,
            user_type: '普通用户',
            premium_days: 0,
          }
        });
      },

      // 更新用户信息
      updateUserInfo: (newInfo) => {
        set((state) => ({
          userInfo: {
            ...state.userInfo,
            ...newInfo,
            // 如果更新了昵称，同时更新 username 字段用于界面显示
            username: newInfo.nickname || state.userInfo.username,
          }
        }));
      },

      // 从 Supabase 按用户名获取用户信息并更新到 store
      fetchUserByUsername: async (username) => {
        if (!username) return null;
        const { data, error } = await supabase
          .from('users')
          .select('id, username, nickname, points, invite_code, parent_invite_code, binance_uid, bg_uid, wechat, okx_uid, created_at, is_verified, user_type, premium_days')
          .eq('username', username)
          .limit(1)
          .maybeSingle();

        if (error) {
          // eslint-disable-next-line no-console
          console.error('获取用户失败:', error);
          return null;
        }

        if (!data) {
          return null;
        }

        const mapped = {
          id: data.id, // 添加用户ID
          username: data.nickname || data.username || '',
          email: data.username || '',
          avatar: '👤',
          joinDate: (data.created_at || '').split('T')[0] || '',
          level: '普通用户',
          points: typeof data.points === 'number' ? data.points : 0,
          parentInviteCode: data.parent_invite_code || '',
          myInviteCode: data.invite_code || '',
          binanceUID: data.binance_uid || '',
          bitgetUID: data.bg_uid || '',
          wechat: data.wechat || '',
          okxUID: data.okx_uid || '',
          is_verified: data.is_verified === 'true' || data.is_verified === true, // 处理字符串或布尔值
          user_type: data.user_type || '普通用户',
          premium_days: typeof data.premium_days === 'number' ? data.premium_days : 0,
        };

        set({
          isLoggedIn: true,
          userInfo: mapped,
        });

        return mapped;
      },

      // 更新积分
      updatePoints: (points) => {
        set((state) => ({
          userInfo: {
            ...state.userInfo,
            points: state.userInfo.points + points
          }
        }));
      },

      // 获取用户信息
      getUserInfo: () => get().userInfo,

      // 获取登录状态
      getLoginStatus: () => get().isLoggedIn,
    }),
    {
      name: 'user-storage', // 本地存储的key
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        userInfo: state.userInfo,
      }),
      // 添加迁移代码，处理旧版本存储的数据
      migrate: (persistedState, version) => {
        // 确保userInfo中包含所有必要的字段
        if (persistedState && persistedState.userInfo) {
          return {
            ...persistedState,
            userInfo: {
              ...persistedState.userInfo,
              // 确保新字段存在，如果没有则使用默认值
              is_verified: persistedState.userInfo.is_verified !== undefined ? 
                persistedState.userInfo.is_verified : false,
              user_type: persistedState.userInfo.user_type || '普通用户',
            }
          };
        }
        return persistedState;
      },
      version: 1, // 添加版本号
    }
  )
);

export default useUserStore; 