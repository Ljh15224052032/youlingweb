import React, { useState } from 'react';
import './Components.css';
import BtcChart from './BtcChart';
import BinanceChart from './BinanceChart';

function TradingTools() {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1H');
  const [indicators, setIndicators] = useState(['MA', 'RSI']);

  const tradingPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT'];
  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D'];
  const availableIndicators = ['MA', 'RSI', 'MACD', 'BB', 'KDJ'];

  const handleIndicatorToggle = (indicator) => {
    if (indicators.includes(indicator)) {
      setIndicators(indicators.filter(i => i !== indicator));
    } else {
      setIndicators([...indicators, indicator]);
    }
  };

  return (
    <div className="component-container">
      <div className="trading-layout">
        <div className="trading-controls">
          <div className="control-group">
            <label>交易对：</label>
            <select 
              value={selectedPair} 
              onChange={(e) => setSelectedPair(e.target.value)}
              className="trading-select"
            >
              {tradingPairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>时间周期：</label>
            <div className="timeframe-buttons">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          
        </div>
        
        <div className="chart-container">
          
          
          <div className="chart-area">
            <BinanceChart symbol={selectedPair} timeframe={timeframe} />
          </div>
          
          
        </div>
        
        
      </div>
    </div>
  );
}

export default TradingTools; 