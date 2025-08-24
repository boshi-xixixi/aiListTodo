/**
 * 豆包AI任务分解服务
 * 负责调用豆包大模型API进行任务分解，将用户输入的自然语言转换为具体的执行步骤
 */

import { TaskStep, DoubaoAPIRequest, DoubaoAPIResponse, AIResponse } from '../types';
import { LocalStorageService } from './localStorage';

/**
 * 豆包AI任务分解服务类
 */
export class TaskDecompositionService {
  private readonly apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  private readonly defaultModel = 'doubao-1.5-lite-32k-250115';
  private storageService: LocalStorageService;

  constructor() {
    this.storageService = new LocalStorageService();
  }

  /**
   * 获取API密钥
   */
  private async getApiKey(): Promise<string | null> {
    try {
      const settings = await this.storageService.getSettings();
      return settings.apiKey || null;
    } catch (error) {
      console.error('获取API密钥失败:', error);
      return null;
    }
  }

  /**
   * 获取AI模型名称
   */
  private async getApiModel(): Promise<string> {
    try {
      const settings = await this.storageService.getSettings();
      return settings.apiModel || this.defaultModel;
    } catch (error) {
      console.error('获取API模型失败:', error);
      return this.defaultModel;
    }
  }

  /**
   * 分解任务为具体步骤
   * @param userInput 用户输入的自然语言描述
   * @returns Promise<TaskStep[]> 分解后的任务步骤数组
   */
  async decomposeTask(userInput: string): Promise<TaskStep[]> {
    try {
      // 验证输入
      if (!userInput || userInput.trim().length === 0) {
        throw new Error('任务描述不能为空');
      }

      // 构建消息数组
       const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
         {
           role: 'system',
           content: this.getSystemPrompt()
         },
         {
           role: 'user',
           content: userInput
         }
       ];

      // 调用豆包API
      const response = await this.callDoubaoAPI(messages);
      
      // 解析AI响应
      const aiResponse = this.parseAIResponse(response.choices[0].message.content);
      
      // 转换为TaskStep格式
      return this.convertToTaskSteps(aiResponse.steps);
      
    } catch (error) {
      console.error('任务分解失败:', error);
      
      // 返回默认的任务步骤
      return this.getDefaultSteps(userInput);
    }
  }

  /**
   * 获取系统提示词
   * @returns string 系统提示词
   */
  private getSystemPrompt(): string {
    return `你是一个专业的任务分解助手，擅长将复杂的任务分解为详细、具体、可执行的步骤。

请遵循以下规则：
1. 将用户的任务分解为6-10个具体可执行的步骤，确保每个步骤都足够详细和具体
2. 每个步骤都要明确、可操作，包含具体的行动指导
3. 步骤要循序渐进，从准备阶段到执行阶段再到完善阶段
4. 为每个步骤配上积极鼓励的话语，让用户感到温暖和动力
5. 步骤要有清晰的逻辑顺序，前后连贯，形成完整的执行路径
6. 鼓励话语要真诚、正面、个性化，能够激发用户的执行动力
7. 每个步骤应该是一个独立的、可完成的小任务
8. 考虑任务的复杂性，适当增加准备工作和检查验证步骤

请严格按照以下JSON格式返回：
{
  "steps": [
    {
      "content": "具体详细的步骤内容，包含明确的行动指导",
      "encouragement": "积极鼓励的话语"
    }
  ]
}

示例：
用户输入："我要准备明天的面试"
返回：
{
  "steps": [
    {
      "content": "收集并整理个人简历，确保所有信息准确无误，突出与职位相关的经验",
      "encouragement": "你的经历很棒，每一段经历都是宝贵的财富！"
    },
    {
      "content": "深入研究目标公司的背景、文化、业务范围和最新动态",
      "encouragement": "知己知彼，你的用心准备一定会让面试官刮目相看！"
    },
    {
      "content": "仔细分析职位描述，理解岗位要求和职责，匹配自己的技能",
      "encouragement": "你有能力胜任这个职位，相信自己的实力！"
    },
    {
      "content": "准备常见面试问题的回答，包括自我介绍、优缺点、职业规划等",
      "encouragement": "充分的准备让你更加自信，你一定能表现出色！"
    },
    {
      "content": "准备3-5个有深度的问题向面试官提问，展现你的专业性和求知欲",
      "encouragement": "好问题体现你的思考深度，这会给面试官留下深刻印象！"
    },
    {
      "content": "选择合适的面试着装，确保整洁专业，符合公司文化",
      "encouragement": "得体的着装是成功的第一步，你会看起来非常专业！"
    },
    {
      "content": "规划面试当天的路线和时间，确保提前15-20分钟到达",
      "encouragement": "守时体现你的责任心，这是职场人的基本素养！"
    },
    {
      "content": "进行模拟面试练习，可以对着镜子或请朋友帮忙，提升表达流畅度",
      "encouragement": "练习让你更加从容，相信你会在面试中发挥出最佳状态！"
    }
  ]
}`;
  }

  /**
   * 调用豆包API
   * @param messages 消息数组
   * @returns Promise<DoubaoAPIResponse> API响应
   */
  private async callDoubaoAPI(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<DoubaoAPIResponse> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('API密钥未配置，请在设置中配置豆包API密钥');
    }

    const model = await this.getApiModel();

    const requestBody: DoubaoAPIRequest = {
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API调用失败: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 解析AI响应内容
   * @param content AI返回的文本内容
   * @returns AIResponse 解析后的响应对象
   */
  private parseAIResponse(content: string): AIResponse {
    try {
      // 尝试直接解析JSON
      const parsed = JSON.parse(content);
      
      if (parsed.steps && Array.isArray(parsed.steps)) {
        return parsed;
      }
      
      throw new Error('响应格式不正确');
      
    } catch (error) {
      console.warn('AI响应解析失败，尝试提取JSON:', error);
      
      // 尝试从文本中提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          if (extracted.steps && Array.isArray(extracted.steps)) {
            return extracted;
          }
        } catch (e) {
          console.warn('提取的JSON解析失败:', e);
        }
      }
      
      // 如果都失败了，返回基于文本的简单分解
      return this.fallbackTextParsing(content);
    }
  }

  /**
   * 备用文本解析方法
   * @param content 文本内容
   * @returns AIResponse 解析后的响应对象
   */
  private fallbackTextParsing(content: string): AIResponse {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const steps = [];
    
    // 尝试提取更多步骤，最多10个
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      if (line.length > 0) {
        steps.push({
          content: line.replace(/^\d+\.?\s*/, ''), // 移除数字前缀
          encouragement: this.getRandomEncouragement()
        });
      }
    }
    
    // 如果步骤太少，补充一些通用步骤
    if (steps.length < 6) {
      const additionalSteps = [
        { content: '制定详细的执行计划和时间安排', encouragement: '好的计划是成功的一半，你很有条理！' },
        { content: '收集和准备所需的资源和工具', encouragement: '充分的准备让你事半功倍！' },
        { content: '开始执行第一个关键步骤', encouragement: '万事开头难，但你已经迈出了重要的一步！' },
        { content: '监控进度并及时调整策略', encouragement: '灵活应变是成功的关键，你做得很好！' },
        { content: '完善和优化执行结果', encouragement: '精益求精的态度让你与众不同！' },
        { content: '总结经验并记录收获', encouragement: '每一次总结都是成长，为你的进步点赞！' }
      ];
      
      while (steps.length < 6 && additionalSteps.length > 0) {
        steps.push(additionalSteps.shift()!);
      }
    }
    
    return { steps };
  }

  /**
   * 转换为TaskStep格式
   * @param steps AI返回的步骤数组
   * @returns TaskStep[] 格式化的任务步骤数组
   */
  private convertToTaskSteps(steps: { content: string; encouragement: string }[]): TaskStep[] {
    return steps.map((step, index) => ({
      id: `step-${Date.now()}-${index}`,
      title: step.content.split('：')[0] || step.content.substring(0, 20) + '...', // 提取标题
      content: step.content,
      description: step.content, // 使用内容作为描述
      encouragement: step.encouragement,
      completed: false,
      stepOrder: index + 1,
      estimatedMinutes: this.estimateStepDuration(step.content), // 估算时间
      difficulty: this.estimateStepDifficulty(step.content) // 估算难度
    }));
  }

  /**
   * 获取默认任务步骤（当AI调用失败时使用）
   * @param userInput 用户输入
   * @returns TaskStep[] 默认步骤数组
   */
  private getDefaultSteps(userInput: string): TaskStep[] {
    const defaultSteps = [
      {
        content: `明确任务目标：深入理解「${userInput}」的具体要求和预期结果`,
        encouragement: '明确的目标是成功的起点，你已经走在正确的道路上！'
      },
      {
        content: '分析任务复杂度，识别可能遇到的挑战和难点',
        encouragement: '未雨绸缪的思维让你更有准备，这很棒！'
      },
      {
        content: '收集和整理完成任务所需的资源、工具和信息',
        encouragement: '充分的准备是成功的基础，你做得很好！'
      },
      {
        content: '制定详细的执行计划，包括时间安排和里程碑设置',
        encouragement: '好的计划是成功的一半，你的条理性令人赞赏！'
      },
      {
        content: '开始执行第一个关键步骤，建立良好的执行节奏',
        encouragement: '万事开头难，但你已经迈出了重要的第一步！'
      },
      {
        content: '持续推进任务执行，保持专注和高效的工作状态',
        encouragement: '你的专注和努力一定会带来丰硕的成果！'
      },
      {
        content: '定期检查进度，及时调整策略和方法',
        encouragement: '灵活应变是智慧的体现，你正在不断优化自己的方法！'
      },
      {
        content: '完善和优化任务成果，确保质量达到预期标准',
        encouragement: '精益求精的态度让你与众不同，这是成功者的品质！'
      },
      {
        content: '总结整个执行过程，记录经验教训和收获',
        encouragement: '每一次总结都是成长的机会，你正在变得更加优秀！'
      }
    ];

    return this.convertToTaskSteps(defaultSteps);
  }

  /**
   * 估算步骤完成时间（分钟）
   */
  private estimateStepDuration(content: string): number {
    const length = content.length;
    const lowerContent = content.toLowerCase();
    
    // 基于内容长度的基础时间
    let baseTime = 15;
    if (length > 30) baseTime = 20;
    if (length > 60) baseTime = 30;
    if (length > 100) baseTime = 45;
    
    // 基于关键词的时间调整
    const quickKeywords = ['整理', '收集', '准备', '选择', '确认'];
    const mediumKeywords = ['分析', '研究', '学习', '练习', '制定', '规划'];
    const complexKeywords = ['开发', '设计', '创建', '编写', '深入', '详细'];
    
    if (quickKeywords.some(keyword => lowerContent.includes(keyword))) {
      return Math.max(baseTime - 5, 10);
    }
    if (complexKeywords.some(keyword => lowerContent.includes(keyword))) {
      return baseTime + 15;
    }
    if (mediumKeywords.some(keyword => lowerContent.includes(keyword))) {
      return baseTime + 5;
    }
    
    return baseTime;
  }

  /**
   * 估算步骤难度
   */
  private estimateStepDifficulty(content: string): 'easy' | 'medium' | 'hard' {
    const lowerContent = content.toLowerCase();
    const length = content.length;
    
    // 高难度关键词
    const hardKeywords = ['深入分析', '开发', '设计', '创建', '编写代码', '解决问题', '优化', '架构', '算法'];
    // 中等难度关键词
    const mediumKeywords = ['分析', '研究', '学习', '制定计划', '规划', '评估', '比较', '选择方案'];
    // 简单难度关键词
    const easyKeywords = ['整理', '收集', '准备', '确认', '检查', '保存', '记录', '查看'];
    
    // 基于关键词判断
    if (hardKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'hard';
    }
    if (mediumKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'medium';
    }
    if (easyKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'easy';
    }
    
    // 基于内容长度和复杂度判断
    if (length > 80 && (lowerContent.includes('详细') || lowerContent.includes('深入') || lowerContent.includes('复杂'))) {
      return 'hard';
    }
    if (length > 50) {
      return 'medium';
    }
    
    return 'easy';
  }

  /**
   * 获取随机鼓励话语
   * @returns string 鼓励话语
   */
  private getRandomEncouragement(): string {
    const encouragements = [
      '你能做到的，相信自己！',
      '每一步都是进步，加油！',
      '你的努力一定会有回报！',
      '坚持下去，成功就在前方！',
      '你比想象中更强大！',
      '今天的努力是明天的收获！',
      '你正在变得更好，继续加油！',
      '相信过程，享受成长！'
    ];
    
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  /**
   * 测试API连接
   * @returns Promise<{success: boolean, error?: string}> 连接结果和错误信息
   */
  async testConnection(): Promise<{success: boolean, error?: string}> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        return { success: false, error: 'API密钥未配置' };
      }

      if (!apiKey.trim()) {
        return { success: false, error: 'API密钥不能为空' };
      }

      const model = await this.getApiModel();
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: '测试' }],
          max_tokens: 5,
          temperature: 0.1
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // 如果无法解析JSON，使用原始错误文本
          if (errorText) {
            errorMessage = errorText.substring(0, 100); // 限制错误信息长度
          }
        }
        
        // 根据状态码提供更友好的错误信息
        switch (response.status) {
          case 401:
            return { success: false, error: 'API密钥无效或已过期' };
          case 403:
            return { success: false, error: 'API密钥权限不足' };
          case 429:
            return { success: false, error: 'API调用频率超限，请稍后重试' };
          case 500:
            return { success: false, error: '服务器内部错误，请稍后重试' };
          default:
            return { success: false, error: errorMessage };
        }
      }
      
      // 验证响应格式
      const data = await response.json();
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        return { success: false, error: 'API响应格式异常' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('API连接测试失败:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: '网络连接失败，请检查网络设置' };
      }
      
      return { success: false, error: error.message || '未知错误' };
    }
  }
}

// 导出单例实例
export const taskDecompositionService = new TaskDecompositionService();