import React, { useState } from 'react';
import './Components.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

function ContractTutorial() {
  const [tutorials] = useState([
    {
      id: 1,
      title: 'Solidity 基础语法',
      level: '入门',
      description: '学习 Solidity 编程语言的基本语法和数据类型，包括变量声明、数据类型、函数定义等核心概念。',
      content: `
        Solidity 是以太坊智能合约开发的主要编程语言。本教程将带您了解：
        
        • 基本语法结构
        • 数据类型（uint, string, bool, address等）
        • 函数的定义和调用
        • 修饰器的使用
        • 事件和日志记录
        
        通过学习这些基础知识，您将为后续的智能合约开发打下坚实的基础。
      `,
      duration: '2小时'
    },
    {
      id: 2,
      title: '智能合约开发实战',
      level: '中级',
      description: '通过实际项目学习智能合约的开发和部署，掌握完整的开发流程。',
      content: `
        本课程通过实际项目带您体验完整的智能合约开发流程：
        
        • 项目需求分析和架构设计
        • 合约代码编写和优化
        • 本地测试环境搭建
        • 合约部署和验证
        • 前端交互集成
        
        您将开发一个完整的代币合约，包括转账、授权、铸造等功能。
      `,
      duration: '4小时'
    },
    {
      id: 3,
      title: 'DeFi 协议开发',
      level: '高级',
      description: '学习去中心化金融协议的设计和实现，掌握 DeFi 核心机制。',
      content: `
        深入学习 DeFi 协议的核心概念和实现：
        
        • 自动化做市商（AMM）原理
        • 流动性挖矿机制设计
        • 借贷协议架构
        • 治理代币经济学
        • 跨链桥接技术
        
        通过实践项目，您将构建一个简化版的 DEX 交易所。
      `,
      duration: '6小时'
    },
    {
      id: 4,
      title: '合约安全审计',
      level: '专家',
      description: '掌握智能合约安全审计的方法和技巧，识别和防范常见安全漏洞。',
      content: `
        智能合约安全是区块链开发的重中之重：
        
        • 常见安全漏洞分析（重入攻击、整数溢出等）
        • 静态分析工具使用
        • 动态测试方法
        • 形式化验证技术
        • 安全审计报告编写
        
        学习如何使用专业工具进行安全审计，保障合约资金安全。
      `,
      duration: '3小时'
    },
   
    
  ]);

  const [expandedTutorial, setExpandedTutorial] = useState(null);

  const handleTutorialClick = (tutorial) => {
    if (expandedTutorial?.id === tutorial.id) {
      setExpandedTutorial(null);
    } else {
      setExpandedTutorial(tutorial);
    }
  };

  return (
    <SimpleBar className="component-container tutorial-scroll">
      <div className="tutorial-container">
        {tutorials.map(tutorial => (
          <div key={tutorial.id} className="guide-item-wrapper">
            <div 
              className={`guide-item ${expandedTutorial?.id === tutorial.id ? 'active' : ''}`}
              onClick={() => handleTutorialClick(tutorial)}
            >
              <div className="guide-header">
                <h3>{tutorial.title}</h3>
                <span className={`level-badge ${tutorial.level}`}>{tutorial.level}</span>
              </div>
            </div>
            
            {expandedTutorial?.id === tutorial.id && (
              <div className="guide-detail-expanded">
                <div className="tutorial-info">
                  <span className="level">等级：{tutorial.level}</span>
                  <span className="duration">时长：{tutorial.duration}</span>
                </div>
                
                <div className="guide-content">
                  <div className="tutorial-description">
                    <p>{tutorial.description}</p>
                  </div>
                  
                  <div className="tutorial-detailed-content">
                    <pre>{tutorial.content}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </SimpleBar>
  );
}

export default ContractTutorial; 