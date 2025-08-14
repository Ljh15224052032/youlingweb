# 游领交易工具 - 看盘功能

## 功能特性

### 🎯 实时K线图表
- 基于TradingView的Lightweight Charts库
- 支持多种时间周期：1分钟、5分钟、15分钟、1小时、4小时、1天
- 实时WebSocket连接，数据更新及时
- 历史数据回看功能，支持500根K线数据

### 📊 图表功能
- **K线图**：显示开盘价、最高价、最低价、收盘价
- **成交量图**：显示交易量，颜色跟随K线涨跌
- **交互功能**：鼠标悬停显示十字光标
- **响应式设计**：自动适应窗口大小变化

### 🔄 实时数据
- 币安WebSocket实时数据流
- 自动更新最新K线数据
- 支持多交易对切换
- 错误处理和重连机制

## 技术实现

### 依赖库
```json
{
  "lightweight-charts": "^4.0.0",
  "axios": "^1.0.0",
  "date-fns": "^2.0.0"
}
```

### 核心组件

#### BinanceChart.js
- 图表初始化和配置
- 历史数据加载
- WebSocket实时数据更新
- 错误处理和加载状态

#### binanceApi.js
- 币安REST API封装
- K线数据获取
- 24小时价格统计
- 交易对信息获取

### API接口

#### 历史K线数据
```javascript
GET /api/v3/klines?symbol=BTCUSDT&interval=1h&limit=500
```

#### WebSocket实时数据
```javascript
wss://stream.binance.com:9443/ws/btcusdt@kline_1h
```

## 使用方法

### 1. 启动应用
```bash
cd youling-react/youling
npm start
```

### 2. 访问交易工具
- 导航到"交易工具"页面
- 选择交易对（BTC/USDT、ETH/USDT等）
- 选择时间周期（1m、5m、15m、1H、4H、1D）

### 3. 图表操作
- **缩放**：鼠标滚轮缩放时间轴
- **平移**：拖拽移动时间轴
- **十字光标**：鼠标悬停显示价格和时间
- **全屏**：点击全屏按钮

## 配置说明

### 图表样式
```javascript
const chartOptions = {
  layout: {
    background: { color: '#1e222d' },
    textColor: '#d1d4dc',
  },
  grid: {
    vertLines: { color: '#2B2B43' },
    horzLines: { color: '#2B2B43' },
  },
  crosshair: { mode: 1 },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
  }
};
```

### K线颜色配置
```javascript
const candleSeries = chart.addCandlestickSeries({
  upColor: '#26a69a',      // 上涨颜色
  downColor: '#ef5350',     // 下跌颜色
  borderUpColor: '#26a69a',
  borderDownColor: '#ef5350',
  wickUpColor: '#26a69a',
  wickDownColor: '#ef5350',
});
```

## 数据格式

### K线数据格式
```javascript
{
  time: 1640995200,    // Unix时间戳（秒）
  open: 46250.50,      // 开盘价
  high: 46500.00,      // 最高价
  low: 46000.00,       // 最低价
  close: 46300.00,     // 收盘价
  volume: 1234.56      // 成交量
}
```

### WebSocket消息格式
```javascript
{
  "e": "kline",        // 事件类型
  "E": 1640995200000,  // 事件时间
  "s": "BTCUSDT",      // 交易对
  "k": {
    "t": 1640995200000, // K线开始时间
    "T": 1640995259999, // K线结束时间
    "o": "46250.50",    // 开盘价
    "h": "46500.00",    // 最高价
    "l": "46000.00",    // 最低价
    "c": "46300.00",    // 收盘价
    "v": "1234.56",     // 成交量
    "x": false          // 是否完成
  }
}
```

## 错误处理

### 常见错误
1. **网络连接失败**：检查网络连接和防火墙设置
2. **API限制**：币安API有请求频率限制
3. **WebSocket断开**：自动重连机制

### 调试信息
- 打开浏览器开发者工具查看控制台日志
- 检查Network标签页的API请求状态
- 查看WebSocket连接状态

## 扩展功能

### 技术指标
- MA（移动平均线）
- RSI（相对强弱指数）
- MACD（指数平滑移动平均线）
- BB（布林带）
- KDJ（随机指标）

### 图表工具
- 趋势线绘制
- 斐波那契回调
- 支撑阻力位标记
- 价格提醒设置

## 注意事项

1. **数据延迟**：WebSocket数据可能有轻微延迟
2. **浏览器兼容性**：需要支持ES2016的现代浏览器
3. **移动端适配**：图表在移动设备上可能需要优化
4. **数据准确性**：仅供参考，实际交易请以官方数据为准

## 许可证

本项目使用MIT许可证。Lightweight Charts库需要遵循TradingView的许可证要求，请在使用时添加相应的归属声明。 