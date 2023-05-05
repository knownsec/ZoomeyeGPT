let auto_dork_prompt = `
要求处理的HTTP response数据只包含响应头部分，需要按照以下规则处理：

删除响应头部分中的 "Date" 字段及相对应的值；
删除响应头部分中的"Connection"字段，如输入的数据中存在"Connection: Keep-Alive" 或 "Connection: close" 等，直接把"Connection: Keep-Alive" 或 "Connection: close"删除；
删除HTTP协议版本；如："HTTP/1.1 200 OK" 删除HTTP协议版本信息后变成了 "200 OK"；
如果处理的HTTP response数据中，存在"Server" 或 "X-Powered-By" 头，对响应头部分中的 "Server" 和 "X-Powered-By" 字段，忽略斜杠（/）后面的内容；
如果处理的HTTP response数据中，存在"Set-Cookie"字段，那么对响应头部分中的 "Set-Cookie" 字段，只保留第一个 cookie 的名字；
对响应头部分中的双引号进行替换为空，其余部分直接保留；
如果处理的HTTP response数据中，存在"Location"字段，对响应头部分中的 "Location" 字段，如果存在完整的URL则按域名进行分割，去掉域名及后面的字符，只保留Location: http(s);// ，如输入的数据中存在"Location: https://api.cloudflare.com/client/v4//" ，处理后输出为"Location: https://" 
如果处理的HTTP response数据中，存在"Location"字段，对响应头部分中的 "Location" 字段，如果存在完整的URL里存在IP，则按IP进分割，去掉IP后组成两个字符串， ，如输入的数据中存在"Location: http://8.8.8.8/aaa.html" ，处理后输出为"Location: http://" +"aaa.html"
最终，将处理后的响应头部分组合成字符串，用双引号及加号连接起来。

注意：只处理提交数据里存在个HTTP头，请不要做随意生成！

下面我给不举个例子你学习一下：

提交的HTTP response数据：

HTTP/1.1  404 Not Found
Server: nginx/1.18.0 (Ubuntu)
Content-Type: text/plain; charset=utf-8
Date: Sun, 09 Apr 2023 00:14:01 GMT
Set-Cookie: abcdef=pp77drqb4l5fpdpogi0ehcl7gb; path=/
Location: http://www.abc.com/ccc
Location: http://423.123.123.123/login
Content-Length: 19
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Keep-Alive: timeout=5, max=98
Connection: Keep-Alive
Connection: close

404 page not found<html><head><body>a aaa bbb</body>

强调一下：
"Date: Sun, 09 Apr 2023 00:14:01 GMT" 这一行符合上面提到的"删除响应头部分中的 'Date' 字段及相对应的值"规则，而直接被删除；
"Connection: Keep-Alive" 和 "Connection: close" 因为符合上面提到的 "删除响应头部分中的'Connection'字段"这条规则，而直接被删除；

通过上面的规则处理后最终输出的结果引号与加号连接的字符串：

"404 Not Found" +"Server: nginx" +"Content-Type: text/plain; charset=utf-8" +"Set-Cookie: abcdef" +"Content-Length: 19" +"Location: http://" +"Location: http://" +"/login" +"Cache-Control: no-store, no-cache, must-revalidate" +"Pragma: no-cache" +"Keep-Alive: timeout=5, max=98" +"404 page not found<html><head><body>a aaa bbb</body>" 

遇到重复字符只保留一个，最终输出为：

"404 Not Found" +"Server: nginx" +"Content-Type: text/plain; charset=utf-8" +"Set-Cookie: abcdef" +"Content-Length: 19"  +"Location: http://" +"/login" +"Cache-Control: no-store, no-cache, must-revalidate" +"Pragma: no-cache" +"Keep-Alive: timeout=5, max=98" +"404 page not found<html><head><body>a aaa bbb</body>" 

下面请一步一步思考并严格按上面的规则处理如下数据：
`;
let grafama_prompt = `
你是一个精通Zoomeye测绘引擎语法的人工智能助手，我将给你一段文字，而你则负责将它转化为精简的，符合zoomeye测绘引擎语法的查询语句，并将结果以文本形式返回，除此以外不要返回额外文字与多余的回车换行。

你熟练掌握了以下语法参考：

country:"CN"：搜索国家地区资产，可以使用国家缩写，也可以使用中/英文全称如country:"中国" 或者 country:"china" （注：country:"中国大陆"是指不包括港澳台的中国大陆地区）
subdivisions:"beijing"：搜索相关指定行政区的资产，中国省会支持中文及英文描述搜索如subdivisions:"湖南"(注意没有“省”字) 或者 subdivisions:"hunan"
city:"changsha"：搜索相关城市资产，中国城市支持中文及英文描述搜索如city:"changsha" city:"长沙"
ssl:"google"：搜索ssl证书存在"google"字符串的资产，常常用来提过公司名及产品来搜索对应的资产
ip:"8.8.8.8"：搜索指定IPv4地址相关资产
ip:"2600:3c00::f03c:91ff:fefc:574a"：搜索指定IPv6地址相关资产
cidr:52.2.254.36/24：搜索IP的C段资产，cidr:52.2.254.36/16 为IP的B段资产 cidr:52.2.254.36/8 为IP的A段资产,如cidr:52.2.254.36/16cidr:52.2.254.36/8
org:"北京大学" 或者organization:"北京大学"：常常用来定位大学、结构、大型互联网公司对应IP资产
isp:"China Mobile"：搜索相关网络服务提供商的资产，可结合org数据相互补充
asn:42893：搜索对应ASN（Autonomous system number）自治系统编号相关IP资产
port:80：搜索相关端口资产，目前不支持同时开放多端口目标搜索
hostname:google.com：搜索相关IP"主机名"的资产
service:"ssh"：搜索对应服务协议的资产，常见服务协议包括：http、ftp、ssh、telnet等等
os:"RouterOS"：搜索相关操作系统，常见系统包括Linux、Windows、RouterOS、IOS、JUNOS等等
title:"Cisco"：搜索html内容里标题中存在"Cisco"的数据
after:"2020-01-01" +port:"50050"：搜索更新时间为"2020-01-01"端口为"50050"以后的资产，时间过滤器需组合其他过滤器使用
before:"2020-01-01" +port:"50050"：搜索更新时间在"2020-01-01"端口为"50050"以前的资产，时间过滤器需组合其他过滤器使用
jarm: "29d29d15d29d29d00029d29d29d29dea0f89a2e5fb09e4d8e099befed92cfa"：搜索相关jarm内容的资产
iconhash:"f3418a443e7d841097c714d69ec4bcb8"：通过 md5 方式对目标数据进行解析，根据图标搜索相关内容的资产，搜索包含“google”图标的相关资产
iconhash:"1941681276"：通过 mmh3 方式对目标数据进行解析，根据图标搜索相关内容的资产，搜索包含“amazon”图标的相关资产
filehash:"0b5ce08db7fb8fffe4e14d05588d49d9"：通过上传方式进行查询，根据解析的文件数据搜索相关内容的资产，搜索包含“Gitlab”解析的相关资产

如果出现的关键词可能出现在上面的语法里，请带上语法词，比如输入一个IP，直接使用ip:x.x.x.xx ，如果提交的关键词可能出现在标题里可以使用title:xxx ，如果关键词可能出现在证书里，请使用ssl:xxxx 等

注意不要用上面语法参考里没有包含的语法词！

在ZoomEye搜索中，用空格表示or运算，用加号表示and运算，用减号表示not运算，括号表示优先处理！

注意：
遇到搜索“可能”属于xxx的资产时候，要使用or运算（也就是空格），应该考虑title、ssl、hostname、org、isp等语法，最终输出的ZoomEye查询语法：(title:"xxx" ssl:"xxx" hostname:"xxx" org:"xxx" isp:"xxx")

下面这是一些学习的例子：

提示词："美国开放80或者443端口的主机"
输出结果：country:"US" +(port:"80" port:"443")

提示词："Russian hosts running RDP or FTP"
输出结果：country:"RU" +(service:"rdp" service:"ftp")

提示词："我需要湖南省长沙市所有使用ChatGPT的网站"
输出结果：country:"中国" +subdivisions:"湖南" +city:"长沙" +title:"ChatGPT"

提示词："搜索存在目录遍历的资产"
输出结果：title:"Index of /"

提示词："搜索使用GoAhead的Web服务器"
输出结果："Server: GoAhead"

提示词："搜索匿名访问的ftp服务器并且存在sh文件的资产"
输出结果："Anonymous user logged in" +"sh"

请认真学习并记住这些案例，请特别注意如果输入的是Web服务器如Apache、IIS、nginx、GoAhead等，明确是用于Web服务器的，请使用http头里的关键词，如"server: Server: Microsoft-IIS/7.5"，而不能使用server:"Microsoft-IIS/7.5"

注意：ZoomEye使用空格表示“或者”，禁止使用OR或者or，禁止使用|或者||。
注意：不要返回额外文字与多余的回车换行，只需要返回ZoomEye搜索语法。

`;

let selectedText;
let selectedRegexpText;
let result;
let regexp_result;
// sw 监听content_script中发过来message，用于gpt重新生成、创建新的zoomeye搜索标签
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.sign == 'generate'){
    send_gpt(selectedText, 'generate');// 重新生成
  } else if(message.sign == 'zoomeye'){
    createTbsZoomeye(result);// 右键创建zoomeye搜索标签
  } else if(message.sign == 'grafama'){
    send_gpt(message.grafama_input_value, 'grafama');// 语法转换的功能
  } else if(message.sign == 'regexp'){
    selectedRegexpText = message.info; // regexp提取
    regexp_result = regex_zoomeye(selectedRegexpText);
    send_content(regexp_result, 'regexp_result');
  } else if(message.sign == 'regexp_zoomeye'){
    createTbsZoomeye(regexp_result);
  }
  sendResponse(`sw ${message.sign} recived`);
  // return true;
});

// sw 发送给content script
let tabId;
function send_content(info, sign){
  let message = {
    'info': info,
    "sign": sign
  };
  if (sign == 'loading' || sign == 'empty_key' || sign == 'regexp'){
    chrome.windows.getCurrent(w => {
      chrome.tabs.query({active: true, windowId: w.id}, tabs => {
        tabId = tabs[0].id;
        chrome.storage.local.set(
          {tab_id: tabId}
        ).then(
          obj => {
            chrome.tabs.sendMessage(tabId, message, res => {
              console.log(`sw send_content ${sign} recived`);
            })
          }
        )
      });
    });
  } else {
    chrome.storage.local.get(
      {tab_id:0}
    ).then(
      obj => {
        chrome.tabs.sendMessage(obj.tab_id, message, res => {
          console.log(`sw send_content ${sign} recived`);
        })
      }
    )
  }
}

// 向gpt发请求
async function gpt_request(data, sign){
    let key = await chrome.storage.local.get(
        { APIKEY: false }
      );
    if (JSON.stringify(key) != '{}' && key.APIKEY !== false){
      api_key = key.APIKEY;
      if (sign =='generate'){
        send_content('loading','loading');// 发送alert，content_script会弹出提示，正在生成
      }
      try {
        let res = await fetch('https://api.openai.com/v1/chat/completions',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${api_key}`
          },
          body: JSON.stringify(data)
        });
        if (!res.ok) {
          if (res.status == 401){
            throw new Error('APIKEY error');
          }
        };
        return res.json();
      } catch (error){
          send_content(error.message, 'error');
      }
    } else {
      send_content('Please set APIKEY', 'empty_key');
    }
    return ;// 终止运行
}

// 右键触发的函数
async function send_gpt(selectedText, sign){
    let data = {
      "model": "gpt-3.5-turbo"
    };
    if (sign=='generate'){
      data["messages"]= [
        {"content": `${auto_dork_prompt}\n\n${selectedText}`, "role": "user"}
      ];
    } else if(sign == 'grafama'){
      data["messages"] = [
        {"content": `${grafama_prompt}\n\n${selectedText}`, "role": "user"}
      ];
      // data["temperature"] = 0.3
    }
    let res_gpt = await gpt_request(data, sign);
    result = parse_res(res_gpt);
    if ( sign == 'generate' && result != ''){
      send_content(result, 'prompt')
    } else if(sign == 'grafama'){
      send_popup(result)
    }
    return;// 终止运行
}

function send_popup(result){
  chrome.runtime.sendMessage(
    { 
      sign:'grafama',
      gpt_res: result
    }, function(res){
      console.log(res)
    } 
  )
}

// 创建zoomeye搜索
function createTbsZoomeye(param){
  if (param != ''){
    chrome.tabs.create({url: `https://www.zoomeye.org/searchResult?q=${encodeURIComponent(param)}`});
  }
}

// 解析gpt响应
function parse_res(data = {}){
  result = '';
  if (data && data['choices']){
      data['choices'].forEach(element => {
          result += element['message']['content'] + '\n';
    });
  }
  return result;
}

function regex_zoomeye(response) {
  const lines = response.split('\n');
  let result = [];

  for (const line of lines) {
    let newLine = line;
    if (line.toUpperCase().startsWith("HTTP/")) {
      newLine = line.replace(/HTTP\/[\d.]*\s/i, "");
    }
    if (newLine.toUpperCase().includes("DATE:") || newLine.toUpperCase().includes("CONNECTION:")) {
      continue;
    }
    if (newLine.toUpperCase().includes("SERVER:") || newLine.toUpperCase().includes("X-POWERED-BY:")) {
      newLine = newLine.replace(/\/.*/, "");
    }
    if (newLine.toUpperCase().includes("SET-COOKIE:")) {
      newLine = newLine.split(';')[0].split('=')[0];
    }
    newLine = newLine.replace(/"/g, '');
    if (newLine.toUpperCase().includes("LOCATION:")) {
      const regex = /^Location:\s*(https?:\/\/)[^/]+(.*)/i;
      if (regex.test(newLine)) {
        newLine = newLine.replace(regex, "Location: $1");
      }
    }
    result.push(newLine);
  }

  result = result.filter(line => line.trim()).map(line => `"${line}"`);
  return result.join(" +").replaceAll("\n","").replaceAll("\r","");
}

// 右键chatgpt提取dork
chrome.contextMenus.create({
  id: "ChatGPT_Zoomeye",
  title:"ChatGPT->ZoomEye",
  contexts: ['selection'] // 只有当选中文字时才会出现此右键菜单
});

// 右键regex提取dork
chrome.contextMenus.create({
  id: "Regex_Zoomeye",
  title:"Regex->ZoomEye",
  contexts: ['selection'] // 只有当选中文字时才会出现此右键菜单
});

function contextClick(info, tab) {
  const { menuItemId } = info;
  selectedText = info.selectionText;
  if (menuItemId === 'ChatGPT_Zoomeye') {
    send_gpt(selectedText, 'generate');
  } else if(menuItemId === 'Regex_Zoomeye'){
    send_content('', 'regexp');
  }
}

chrome.contextMenus.onClicked.addListener(contextClick);
