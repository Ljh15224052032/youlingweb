import axios from 'axios';

// 币安API基础URL
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// 时区转换函数 - 将UTC时间转换为东八区（UTC+8）
export const timeToEastEight = (originalTime) => {
  // 东八区偏移量：8小时 = 8 * 3600 = 28800秒
  const EAST_EIGHT_OFFSET = 8 * 3600;
  return originalTime + EAST_EIGHT_OFFSET;
};

// 反向转换函数 - 将东八区时间转换回UTC（用于API调用）
export const timeFromEastEight = (eastEightTime) => {
  // 东八区偏移量：8小时 = 8 * 3600 = 28800秒
  const EAST_EIGHT_OFFSET = 8 * 3600;
  return eastEightTime - EAST_EIGHT_OFFSET;
};

// 创建axios实例
const binanceApi = axios.create({
  baseURL: BINANCE_API_BASE,
  timeout: 10000,
});

// 获取K线数据
export const getKlineData = async (symbol, interval, limit = 500, endTime = null) => {
  try {
    const params = {
      symbol: symbol.replace('/', ''),
      interval: interval,
      limit: limit
    };

    // 如果指定了结束时间，则获取该时间之前的数据
    if (endTime) {
      // 将东八区时间转换回UTC，然后转换为毫秒
      params.endTime = timeFromEastEight(endTime) * 1000;
    }

    const response = await binanceApi.get('/klines', {
      params: params
    });

    return response.data.map(candle => ({
      time: timeToEastEight(Math.floor(candle[0] / 1000)), // 转换为秒并调整为东八区时间
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));
  } catch (error) {
    console.error('获取K线数据失败:', error);
    throw error;
  }
};

// 获取历史K线数据（用于加载更多数据）
export const getHistoricalKlineData = async (symbol, interval, limit = 100, beforeTime) => {
  try {
    const response = await binanceApi.get('/klines', {
      params: {
        symbol: symbol.replace('/', ''),
        interval: interval,
        limit: limit,
        // 将东八区时间转换回UTC，然后转换为毫秒
        endTime: timeFromEastEight(beforeTime) * 1000
      }
    });

    return response.data.map(candle => ({
      time: timeToEastEight(Math.floor(candle[0] / 1000)), // 转换为秒并调整为东八区时间
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));
  } catch (error) {
    console.error('获取历史K线数据失败:', error);
    throw error;
  }
};

// 获取24小时价格统计
export const get24hrTicker = async (symbol) => {
  try {
    const response = await binanceApi.get('/ticker/24hr', {
      params: {
        symbol: symbol.replace('/', '')
      }
    });

    return {
      symbol: response.data.symbol,
      priceChange: parseFloat(response.data.priceChange),
      priceChangePercent: parseFloat(response.data.priceChangePercent),
      weightedAvgPrice: parseFloat(response.data.weightedAvgPrice),
      prevClosePrice: parseFloat(response.data.prevClosePrice),
      lastPrice: parseFloat(response.data.lastPrice),
      lastQty: parseFloat(response.data.lastQty),
      bidPrice: parseFloat(response.data.bidPrice),
      askPrice: parseFloat(response.data.askPrice),
      openPrice: parseFloat(response.data.openPrice),
      highPrice: parseFloat(response.data.highPrice),
      lowPrice: parseFloat(response.data.lowPrice),
      volume: parseFloat(response.data.volume),
      quoteVolume: parseFloat(response.data.quoteVolume),
      openTime: response.data.openTime,
      closeTime: response.data.closeTime,
      count: response.data.count
    };
  } catch (error) {
    console.error('获取24小时统计失败:', error);
    throw error;
  }
};

// 获取当前价格
export const getCurrentPrice = async (symbol) => {
  try {
    const response = await binanceApi.get('/ticker/price', {
      params: {
        symbol: symbol.replace('/', '')
      }
    });

    return {
      symbol: response.data.symbol,
      price: parseFloat(response.data.price)
    };
  } catch (error) {
    console.error('获取当前价格失败:', error);
    throw error;
  }
};

// 时间周期映射
export const timeframeMap = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1H': '1h',
  '4H': '4h',
  '1D': '1d'
};

// 获取支持的交易对列表
export const getSupportedPairs = async () => {
  try {
    const response = await binanceApi.get('/exchangeInfo');
    const usdtPairs = response.data.symbols
      .filter(symbol => symbol.quoteAsset === 'USDT' && symbol.status === 'TRADING')
      .map(symbol => `${symbol.baseAsset}/USDT`);
    
    return usdtPairs.slice(0, 20); // 返回前20个USDT交易对
  } catch (error) {
    console.error('获取支持的交易对失败:', error);
    return ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'];
  }
}; 