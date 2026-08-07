# 祈愿记录分析功能 · 开发记录

> 日期: 2026-08-05
> 项目: Teyvat Observatory(原神观测台, Electron + React + Vite)
> 参考实现: TeyvatGuide 0.11.2 (github.com/BTMuli/TeyvatGuide, 源码位于 ~/Downloads/TeyvatGuide-0.11.2.zip)

## 一、功能需求

1. 打开软件不再直接显示 UID 查询,而是显示两张卡片:
   - 卡片1: UID 查询(原功能)
   - 卡片2: 祈愿记录 —— 米游社扫码登录后获取祈愿记录并分析
2. 已登录时,卡片2按钮显示"查看 <原神昵称> 的抽卡分析",右侧有"重新扫码"按钮
3. 分析页只显示五星获取情况 + 获得该五星的抽数
4. 角色活动祈愿(301)与角色活动祈愿·其二(400)共享保底,合并统计

## 二、实现架构

```
electron/mihoyo.cjs   主进程: DS签名 + 全部米哈游 API(Node fetch, 无 CORS 问题)
electron/main.cjs     IPC handler 注册(mihoyo:*)
electron/preload.cjs  contextBridge 暴露 window.electronAPI.mihoyo
src/api/mihoyo.js     渲染端封装(localStorage 存 cookie/角色)
src/components/HomeScreen.jsx    首页双卡片
src/components/QrLoginModal.jsx  扫码弹窗 + 轮询 + 角色选择
src/components/GachaReport.jsx   祈愿分析页
src/data/gacha-icons.json        物品图标映射(scripts/gen-gacha-icons.cjs 生成, 354 条)
scripts/*.cjs          CLI 测试脚本(详见第五节)
```

## 三、米哈游 API 链路(全部照搬 TeyvatGuide 0.11.2)

### 1. 扫码登录(passport-api.mihoyo.com)
- POST `/account/ma-cn-passport/app/createQRLogin`
  - headers: `x-rpc-device_id`(UUID), `user-agent: HYPContainer/1.3.3.182`, `x-rpc-app_id: ddxf5dufpuyo`, `x-rpc-client_type: 3`, content-type + body `{}`(**必须带空 body, 否则返回 data 为空**)
  - 返回: `{ url, ticket }`(url 是 user.mihoyo.com 官方二维码页)
- POST `/account/ma-cn-passport/app/queryQRLoginStatus`, body `{ ticket }`
  - 状态: `Created`(未扫) / `Scanned`(已扫待确认) / `Confirmed`(成功)
  - Confirmed 时返回 `user_info.aid/mid` + `tokens[0].token`(即 stoken)
  - retcode -106 = 二维码过期,需刷新

### 2. stoken 补全
- GET `/account/auth/api/getCookieAccountInfoBySToken?stoken=xxx` → cookie_token(需 DS 签名 X4 + cookie: stoken;mid)
- GET `/account/auth/api/getLTokenBySToken?stoken=xxx` → ltoken

### 3. 游戏角色 & authkey(api-takumi.mihoyo.com)
- GET `/binding/api/getUserGameRolesByCookie` → 角色列表(过滤 game_biz === 'hk4e_cn')
- POST `/binding/api/genAuthKey`, body `{ auth_appid: 'webview_gacha', game_biz, game_uid, region }`
  - DS 签名用 **LK2 salt + isSign=true**(仅 salt&t&r, 6位随机)

### 4. 祈愿记录(public-operation-hk4e.mihoyo.com)
- GET `/gacha_info/api/getGachaLog`
  - params: `lang=zh-cn, auth_appid=webview_gacha, authkey, authkey_ver=1, sign_type=2, gacha_type, size=20, end_id`
  - **无需 DS 签名和 cookie**, 仅需 authkey(有效期约24小时)
- gacha_type: 100 新手 / 200 常驻 / 301 角色活动 / 302 武器活动 / 400 角色活动·其二 / 500 集录

### 5. DS 签名算法(米游社 2.109.0)
```
salt: K2=47f15f1b66bee46b816115d8e8e6ebb6
      LK2=d9200c846b10886e8c874fc33c8f308b
      X4=xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs
      X6=t0qEgfub6cvueAPgR5m9aQWWVciEer7v
一般: md5(`salt=${salt}&t=${t}&r=${random}&b=${body}&q=${query}`)
      body/query 为字典序排序的 key=value&... 字符串(GET 用 query, POST 用 body)
isSign: md5(`salt=${salt}&t=${t}&r=${random}`), random 为 6 位字母数字
输出: `${t},${random},${md5}` 放入 `ds` header
```
- BBS UA: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) miHoYoBBS/2.109.0`
- 设备信息: device_id = 固定 UUID(存 userData), device_fp = "0000000000000"(TeyvatGuide 同款默认值)

## 四、踩过的坑(重要!)

1. **POST 无 body 返回空 data**: createQRLogin 必须带 `content-type: application/json` + body `{}`
2. **响应层级**: `resp.data.data.xxx`, 主进程 assertOk 返回 `resp.data`, 不要直接读外层
3. **-110 visit too frequently 限流**: 拉祈愿记录必须加请求间隔(600ms)+ 卡池间间隔(800ms)+ 失败重试(3次, 2s/4s/6s 递增)。修复前 301 池拉 38 页必挂
4. **祈愿 id 是 19 位字符串, 数字减法排序错乱**: JS Number 精度 2^53 ≈ 16 位, `a.id - b.id` 会把相邻 id 排反。**必须用 `String(a.id).localeCompare(String(b.id))`**(TeyvatGuide 同款)。endId 分页游标用字符串拼接, 无此问题
5. **终端二维码裁剪破坏模块**: qrcode 库 `type: 'terminal'` 用 ▀▄ 半块字符垂直合并两行模块, 裁剪任何一行都会破坏二维码。必须保留完整输出(含首尾边框)
6. **二维码渲染格式**: 终端里贴 ASCII 二维码不要加缩进(会错位); terminal 模式的底部 ▀ 长条是静区, 用户会误以为干扰但实际可扫
7. **React 闭包陷阱**: QrLoginModal 轮询 setInterval 里引用的 ticket 必须存 ref(ticketRef.current), 否则闭包捕获旧值(空字符串), 永远查不到登录状态
8. **301+400 合并**: 两池共享保底, 合并后按 id 字符串排序即可得到正确抽卡顺序, 保底/垫抽计算自然正确
9. **登录会话两处存储**: 应用内 localStorage('mihoyo_cookie_v1') 与 CLI 测试文件(/tmp/mihoyo-cookie.json)是分开的; 应用启动时经 `mihoyo:devCookie` IPC 自动导入(开发便利, 发布前应移除)

## 五、测试脚本

```
node scripts/gen-gacha-icons.cjs      # 生成 gacha-icons.json(需 genshin-db)
node scripts/qr-login-terminal.cjs    # 终端二维码 + 完整登录链路(扫码)
node scripts/poll-login-auto.cjs      # 自动刷新版扫码轮询 + 全链路(后台运行)
node scripts/resume-gacha.cjs         # 免扫码重测(读 /tmp/mihoyo-cookie.json)
node scripts/check-id.cjs             # 检查 id 精度/格式
```

## 六、实测结果(2026-08-05, 账号 UID 338521150 "雨.")

- 扫码登录 → cookie_token/ltoken → 角色 → authkey → 祈愿记录全链路通过
- 总记录 968 条: 新手池 10 / 常驻池 172(五星3) / 角色池 723(五星14) / 武器池 62(五星1) / 集录池 1
- 限流保护生效(角色池 38 页无中断)

## 七、已知限制 / 待办

- [ ] salt 与米游社版本绑定(2.109.0), 若米游社更新版本导致 salt 失效, 需从新版 TeyvatGuide 提取
- [ ] 正式发布前移除 `mihoyo:devCookie` IPC(开发导入 CLI 会话用)
- [ ] 登录 stoken 长期有效, 但米哈游可能定期失效, 失效需重新扫码
- [ ] 打包: `npm run electron:build:win`(electron-builder + NSIS)
