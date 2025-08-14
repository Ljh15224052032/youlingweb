import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import { getKlineData, getHistoricalKlineData, timeframeMap, timeToEastEight } from '../services/binanceApi';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const BinanceChart = ({ symbol = 'BTC/USDT', timeframe = '1H' }) => {
  const chartContainerRef = useRef();
  const volumeContainerRef = useRef();
  const rsiContainerRef = useRef();
  
  const chartRef = useRef();
  const volumeChartRef = useRef();
  const rsiChartRef = useRef();
  
  const candleSeriesRef = useRef();
  const volumeSeriesRef = useRef();
  const rsiSeriesRef = useRef();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // 保存已加载的数据
  const currentDataRef = useRef({
    candleData: [],
    volumeData: [],
    rsiData: []
  });

  // 计算RSI指标
  const calculateRSI = (prices, period = 14) => {
    if (prices.length < period + 1) return [];
    
    const gains = [];
    const losses = [];
    
    // 计算价格变化
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // 计算平均增益和损失
    const avgGain = [];
    const avgLoss = [];
    
    // 初始平均值
    let sumGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0);
    let sumLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0);
    
    avgGain.push(sumGain / period);
    avgLoss.push(sumLoss / period);
    
    // 计算后续的平均值
    for (let i = period; i < gains.length; i++) {
      const newAvgGain = (avgGain[avgGain.length - 1] * (period - 1) + gains[i]) / period;
      const newAvgLoss = (avgLoss[avgLoss.length - 1] * (period - 1) + losses[i]) / period;
      
      avgGain.push(newAvgGain);
      avgLoss.push(newAvgLoss);
    }
    
    // 计算RSI
    const rsi = [];
    for (let i = 0; i < avgGain.length; i++) {
      const rs = avgGain[i] / avgLoss[i];
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }
    
    return rsi;
  };

  // 初始化主K线图表
  useEffect(() => {
    
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: '#758696',
          style: LineStyle.Solid,
          visible: true,
          labelVisible: true, // 控制"竖线标签"的显示（价格）
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: LineStyle.Solid,
          visible: true,
          labelVisible: true, // 控制"横线标签"的显示（时间）
        },
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // 添加监听器检测左滑加载历史数据
    chart.timeScale().subscribeVisibleTimeRangeChange(timeRange => {
      if (!timeRange || loadingMore) return;
      
      // 获取当前已加载数据的最早时间
      const currentData = currentDataRef.current.candleData;
      if (currentData.length === 0) return;
      
      const earliestDataTime = currentData[0].time;
      const visibleFromTime = timeRange.from;
      
      // 当可视范围接近已加载数据的开始时间时，加载更多历史数据
      // 这里我们设置一个缓冲区，提前加载数据以提供更好的用户体验
      const timeBuffer = 3600; // 1小时的缓冲时间（秒）
      if (visibleFromTime <= earliestDataTime + timeBuffer) {
        loadMoreHistoricalData();
      }
    });

    // 响应式调整
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // 初始化交易量图表
  useEffect(() => {
    if (!volumeContainerRef.current) return;

    const volumeChart = createChart(volumeContainerRef.current, {
      width: volumeContainerRef.current.clientWidth,
      height: 150,
      layout: {
        background: { color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: '#758696',
          style: LineStyle.Solid,
          visible: true,
          labelVisible: true, // 控制"竖线标签"的显示（价格）
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: LineStyle.Solid,
          visible: true,
          labelVisible: true, // 控制"横线标签"的显示（时间）
        },
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const volumeSeries = volumeChart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
    });

    volumeChartRef.current = volumeChart;
    volumeSeriesRef.current = volumeSeries;

    // 同步时间轴
    if (chartRef.current) {
      volumeChart.timeScale().subscribeVisibleTimeRangeChange(() => {
        const timeRange = volumeChart.timeScale().getVisibleRange();
        if (timeRange) {
          chartRef.current.timeScale().setVisibleRange(timeRange);
        }
      });
    }

    return () => {
      if (volumeChartRef.current) {
        volumeChartRef.current.remove();
      }
    };
  }, []);

  // 初始化RSI图表
  useEffect(() => {
    if (!rsiContainerRef.current) return;

    const rsiChart = createChart(rsiContainerRef.current, {
      width: rsiContainerRef.current.clientWidth,
      height: 150,
      layout: {
        background: { color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: '#758696',
          style: LineStyle.Solid,
          visible: true,
          labelVisible: true, // 控制"竖线标签"的显示（价格）
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: LineStyle.Solid,
          visible: true,
          labelVisible: true, // 控制"横线标签"的显示（时间）
        },
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const rsiSeries = rsiChart.addLineSeries({
      color: '#ff9800',
      lineWidth: 2,
    });

    rsiChartRef.current = rsiChart;
    rsiSeriesRef.current = rsiSeries;

    // 同步时间轴
    if (chartRef.current) {
      rsiChart.timeScale().subscribeVisibleTimeRangeChange(() => {
        const timeRange = rsiChart.timeScale().getVisibleRange();
        if (timeRange) {
          chartRef.current.timeScale().setVisibleRange(timeRange);
        }
      });
    }

    return () => {
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
      }
    };
  }, []);

  // 加载历史K线数据
  const loadHistoricalData = async () => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !rsiSeriesRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getKlineData(symbol, timeframeMap[timeframe], 500);
      
      // 准备K线数据
      const candleData = data.map(item => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      // 准备成交量数据
      const volumeData = data.map(item => ({
        time: item.time,
        value: item.volume,
        color: item.close >= item.open ? '#26a69a' : '#ef5350',
      }));

      // 计算RSI
      const closePrices = data.map(item => item.close);
      const rsiValues = calculateRSI(closePrices);
      
      // 准备RSI数据
      const rsiData = [];
      for (let i = 0; i < rsiValues.length; i++) {
        rsiData.push({
          time: data[i + 14].time, // RSI从第14个数据点开始
          value: rsiValues[i],
        });
      }

      // 保存当前数据
      currentDataRef.current = {
        candleData: candleData,
        volumeData: volumeData,
        rsiData: rsiData
      };

      // 设置历史数据
      candleSeriesRef.current.setData(candleData);
      volumeSeriesRef.current.setData(volumeData);
      rsiSeriesRef.current.setData(rsiData);

      // 设置RSI的超买超卖线
      if (rsiChartRef.current && rsiData.length > 0) {
        const overboughtLine = rsiChartRef.current.addLineSeries({
          color: '#ef5350',
          lineWidth: 1,
          lineStyle: 1,
        });
        const oversoldLine = rsiChartRef.current.addLineSeries({
          color: '#26a69a',
          lineWidth: 1,
          lineStyle: 1,
        });

        // 添加70和30的水平线
        const timeRange = {
          from: rsiData[0].time,
          to: rsiData[rsiData.length - 1].time,
        };
        
        const overboughtData = [
          { time: timeRange.from, value: 70 },
          { time: timeRange.to, value: 70 },
        ];
        const oversoldData = [
          { time: timeRange.from, value: 30 },
          { time: timeRange.to, value: 30 },
        ];
        overboughtLine.setData(overboughtData);
        oversoldLine.setData(oversoldData);
      }

      // 自动调整时间轴以显示所有数据
      chartRef.current.timeScale().fitContent();

      setLoading(false);
    } catch (error) {
      console.error('加载历史数据失败:', error);
      setError('加载历史数据失败');
      setLoading(false);
    }
  };

  // 加载更多历史数据
  const loadMoreHistoricalData = async () => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !rsiSeriesRef.current || loadingMore) {
      return;
    }

    setLoadingMore(true);
    console.log('开始加载更多历史数据...');

    try {
      const currentData = currentDataRef.current.candleData;
      if (currentData.length === 0) {
        setLoadingMore(false);
        return;
      }

      // 获取当前最早的时间点，币安API需要毫秒时间戳
      const earliestTime = currentData[0].time;
      
      // 加载100条更早的数据（增加数量以减少请求频率）
      const newData = await getHistoricalKlineData(symbol, timeframeMap[timeframe], 100, earliestTime);
      
      if (newData.length === 0) {
        console.log('没有更多历史数据可加载');
        setLoadingMore(false);
        return;
      }

      console.log(`成功获取 ${newData.length} 条历史数据`);

      // 过滤掉重复的数据（避免时间重叠）
      const filteredNewData = newData.filter(item => item.time < earliestTime);
      
      if (filteredNewData.length === 0) {
        console.log('新数据与现有数据重叠，跳过合并');
        setLoadingMore(false);
        return;
      }

      // 准备新的K线数据
      const newCandleData = filteredNewData.map(item => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      // 准备新的成交量数据
      const newVolumeData = filteredNewData.map(item => ({
        time: item.time,
        value: item.volume,
        color: item.close >= item.open ? '#26a69a' : '#ef5350',
      }));

      // 重新计算所有数据的RSI（包括新数据和现有数据）
      const allClosePrices = [...filteredNewData.map(item => item.close), ...currentDataRef.current.candleData.map(item => item.close)];
      const allRsiValues = calculateRSI(allClosePrices);
      
      // 准备完整的RSI数据
      const allData = [...filteredNewData, ...currentDataRef.current.candleData];
      const rsiData = [];
      
      // RSI需要14个周期才能开始计算，所以从第14个数据点开始
      const rsiStartIndex = 14;
      for (let i = rsiStartIndex; i < allData.length && i - rsiStartIndex < allRsiValues.length; i++) {
        rsiData.push({
          time: allData[i].time,
          value: allRsiValues[i - rsiStartIndex],
        });
      }

      // 合并数据（新数据在前）
      const mergedCandleData = [...newCandleData, ...currentDataRef.current.candleData];
      const mergedVolumeData = [...newVolumeData, ...currentDataRef.current.volumeData];

      // 更新当前数据引用
      currentDataRef.current = {
        candleData: mergedCandleData,
        volumeData: mergedVolumeData,
        rsiData: rsiData
      };

      // 更新图表数据
      candleSeriesRef.current.setData(mergedCandleData);
      volumeSeriesRef.current.setData(mergedVolumeData);
      rsiSeriesRef.current.setData(rsiData);

      console.log(`成功加载并合并 ${filteredNewData.length} 条历史数据`);
      setLoadingMore(false);
    } catch (error) {
      console.error('加载更多历史数据失败:', error);
      setLoadingMore(false);
    }
  };



  // 当交易对或时间周期改变时重新加载数据
  useEffect(() => {
    if (candleSeriesRef.current && volumeSeriesRef.current && rsiSeriesRef.current) {
      loadHistoricalData();
    }
  }, [symbol, timeframe]);

  // 添加依赖关系以确保loadMoreHistoricalData可以访问最新的状态
  useEffect(() => {
    // 确保函数可以访问最新的loadingMore状态
  }, [loadingMore]);

  // 建立WebSocket连接获取实时数据
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const wsSymbol = symbol.replace('/', '').toLowerCase();
    const wsInterval = timeframeMap[timeframe];
    const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${wsInterval}`);

    socket.onopen = () => {
      console.log('WebSocket连接已建立');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.k) {
          const k = message.k;
          const candleData = {
            time: timeToEastEight(Math.floor(k.t / 1000)), // 转换为东八区时间
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
          };

          const volumeData = {
            time: timeToEastEight(Math.floor(k.t / 1000)), // 转换为东八区时间
            value: parseFloat(k.v),
            color: parseFloat(k.c) >= parseFloat(k.o) ? '#26a69a' : '#ef5350',
          };

          // 更新最新的K线数据
          candleSeriesRef.current.update(candleData);
          volumeSeriesRef.current.update(volumeData);
        }
      } catch (error) {
        console.error('处理WebSocket消息失败:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket连接已关闭');
    };

    return () => {
      socket.close();
    };
  }, [symbol, timeframe]);

  return (
    <SimpleBar style={{height:'calc(100vh - 200px)'}} className="binance-chart-container">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">加载历史数据中...</div>
        </div>
      )}
      {loadingMore && (
        <div className="loading-more-indicator">
          <div className="loading-more-text">加载更多历史数据中...</div>
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* K线图表 */}
      <div className="chart-section">
        <h4 className="chart-title">K线图</h4>
        <div ref={chartContainerRef} className="chart-container" />
      </div>
      
      {/* 交易量图表 */}
      <div className="chart-section">
        <h4 className="chart-title">交易量</h4>
        <div ref={volumeContainerRef} className="chart-container" />
      </div>
      
      {/* RSI图表 */}
      <div className="chart-section">
        <h4 className="chart-title">RSI指标</h4>
        <div ref={rsiContainerRef} className="chart-container" />
      </div>
    </SimpleBar>
  );
};

export default BinanceChart;
