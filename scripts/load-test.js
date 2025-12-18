/**
 * k6 负载测试脚本
 * 用于模拟多用户并发访问，测试系统性能
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');

// 测试配置
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // 30秒内逐渐增加到20个用户
    { duration: '1m', target: 50 },   // 1分钟内增加到50个用户
    { duration: '30s', target: 100 }, // 30秒内增加到100个用户
    { duration: '1m', target: 100 },  // 保持100个用户1分钟
    { duration: '30s', target: 0 },   // 30秒内降到0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%的请求应在500ms内完成
    http_req_failed: ['rate<0.1'],    // 错误率应低于10%
    errors: ['rate<0.1'],             // 自定义错误率应低于10%
  },
};

const BASE_URL = 'http://localhost:3000';

// 测试场景
export default function () {
  // 测试1: 访问首页
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    '首页状态码为200': (r) => r.status === 200,
    '首页响应时间<500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);

  // 测试2: 访问登录页面
  res = http.get(`${BASE_URL}/login`);
  check(res, {
    '登录页状态码为200': (r) => r.status === 200,
    '登录页响应时间<500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  sleep(1);

  // 测试3: 访问帖子列表
  res = http.get(`${BASE_URL}/posts`);
  check(res, {
    '帖子列表状态码为200': (r) => r.status === 200,
    '帖子列表响应时间<1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
  
  sleep(2);

  // 测试4: 模拟登录请求
  const loginPayload = JSON.stringify({
    username: 'testuser',
    password: 'testpass123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, params);
  check(res, {
    '登录请求完成': (r) => r.status === 200 || r.status === 401,
    '登录响应时间<1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);
}

// 测试结束后的总结
export function handleSummary(data) {
  return {
    'reports/performance/k6-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}✓ 测试完成\n\n`;
  summary += `${indent}场景统计:\n`;
  summary += `${indent}  ✓ 虚拟用户: ${data.metrics.vus.values.max}\n`;
  summary += `${indent}  ✓ 总请求数: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}  ✓ 请求速率: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n\n`;
  
  summary += `${indent}响应时间:\n`;
  summary += `${indent}  ✓ 平均: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  ✓ 最小: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  summary += `${indent}  ✓ 最大: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  summary += `${indent}  ✓ P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n\n`;
  
  summary += `${indent}错误率:\n`;
  summary += `${indent}  ✓ 失败请求: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  
  return summary;
}
