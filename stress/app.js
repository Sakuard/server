import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10, // 虛擬使用者數量
  duration: '30s', // 測試持續時間
};

export default function () {
  let url = 'http://localhost:3000/auth/service/user/v1';

  let headers = {
    'Content-Type': 'application/json',
  };

  let payload = JSON.stringify({
    username: 'matt',
    role: 'admin',
  });

  let res = http.post(url, payload, { headers });
  console.log(res)

  // 驗證回應狀態碼是否為 200
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // 等待 1 秒，模擬真實使用者的行為
  sleep(1);
}