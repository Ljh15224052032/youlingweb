import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import supabase from '../services/supabaseClient';

// 生成唯一邀请码

// 生成父邀请码（模拟从其他用户获取）


const useUserStore = create(
  persist(
    (set, get) => ({
      // 用户状态
      isLoggedIn: false,
      userInfo: {
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
      },

      // 登录
      login: async (userData) => {
        // 如果传入了 username，从 Supabase 获取完整用户信息
        if (userData.username || userData.email) {
          const username = userData.username || userData.email;
          const supabaseUser = await get().fetchUserByUsername(username);
          
          if (supabaseUser) {
            // 成功从 Supabase 获取到用户信息，已经在 fetchUserByUsername 中设置了 store
            return;
          }
        }
        
        // 如果没有从 Supabase 获取到用户信息，使用传入的数据
        set({
          isLoggedIn: true,
          userInfo: {
            ...userData,
            joinDate: new Date().toISOString().split('T')[0],
            level: 'VIP',
            points: userData.points || 1250,
            parentInviteCode: userData.parent_invite_code || '',
            myInviteCode: userData.invite_code || '',
          }
        });
      },

      // 登出
      logout: () => {
        set({
          isLoggedIn: false,
          userInfo: {
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
          .select('id, username, nickname, points, invite_code, parent_invite_code, binance_uid, bg_uid, created_at')
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
    }
  )
);

export default useUserStore; 