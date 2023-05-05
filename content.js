// 创建正在搜索用html标签
let div_parent = document.createElement('div');
let div_child_one = document.createElement('div');
let span = document.createElement('span');
let button = document.createElement('button');

// prompt提示用的html标签
let prompt_ele = document.createElement('div');
let generate_button = document.createElement('button');
generate_button.id = "generate_id";
let zoomeye_button = document.createElement('button');
let label = document.createElement('label');
let button_div = document.createElement('div');

// content_script 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.sign == 'loading'){
        create_div();
    } else if(message.sign == 'prompt'){
        document.getElementById("div_parent").style = "display: none";
        create_prompt(message.info);
    } else if(message.sign == "empty_key") {
        alert(message.info);
    } else if(message.sign == "error") {
        document.getElementById("div_parent").style = "display: none";
        alert(message.info);
    } else if(message.sign == "regexp") {
        chrome.runtime.sendMessage(
            {
                'sign': 'regexp',
                'info': window.getSelection().toString()
            },
            function(res){
                console.log(res)
            }
        )
    } else if(message.sign == "regexp_result"){
        create_regexp_result(message.info);
    }
    sendResponse('content ok');
});

// loading
function create_div(){
    div_parent.style = "position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);text-align: center;"
    div_parent.id = "div_parent"
    
    div_child_one.style = "width: 3rem;height: 3rem;border-radius: 50%;border: 0.5rem solid #ccc;border-top-color: rgb(58, 198, 233);animation: zoomeye_plugin_spin 1s linear infinite;"
    div_parent.appendChild(div_child_one);
    document.body.appendChild(div_parent);

    const style = document.createElement('style');
    document.head.appendChild(style);
    
    // 定义动画名称和样式
    const keyframes = `@keyframes zoomeye_plugin_spin {
        to {
          transform: rotate(360deg);
        }
      }`;

    // 将动画样式添加到 style 标签中
    style.sheet.insertRule(keyframes, style.sheet.cssRules.length);
};

function create_prompt(message){
    // 设置标签的css样式
    prompt_ele.style = "display:flex; justify-content:flex-end; position:fixed; top:30%; left:50%; transform:translate(-50%, -50%); border-radius:10px; padding:20px; background-color:#fff; box-shadow:0px 0px 10px #888;z-index:999;flex-direction: column;";
    button_div.style = "display:flex; width:100%; justify-content:flex-end; margin-top:10px;";
    generate_button.style = "display:block; background-color:#007bff; color:#fff; padding:5px 10px; border:none; border-radius:5px; margin-right:10px; width: 100%;";
    generate_button.innerText = "Regenerate";
    zoomeye_button.style = "display: block;background-color:#007bff; color:#fff; padding:5px 10px; border:none; border-radius:5px; width: 100%;";
    zoomeye_button.innerText = "ZoomEye Search";
    label.innerText = message;
    prompt_ele.appendChild(label);
    button_div.appendChild(generate_button);
    button_div.appendChild(zoomeye_button);
    prompt_ele.appendChild(button_div);
    document.body.appendChild(prompt_ele);

    prompt_ele.onmouseup = function(){
        prompt_ele.style="display:none"
    }

    // 在重新生成按钮上添加事件绑定
    generate_button.onmousedown = function(){
        chrome.runtime.sendMessage({
            'sign': 'generate'
        }, function(res){
            prompt_ele.style= "display:none"
        });
    };

    // 在ZoomEye搜索按钮上添加事件绑定
    zoomeye_button.onmousedown = function(){
        chrome.runtime.sendMessage({
            'sign': 'zoomeye'
        }, function(res){
            prompt_ele.style= "display:none"
        });
    };
}

function create_regexp_result(message){
    // 设置标签的css样式
    if (document.getElementById("generate_id")){
        button_div.removeChild(generate_button);
    }
    prompt_ele.style = "display:flex; justify-content:flex-end; position:fixed; top:30%; left:50%; transform:translate(-50%, -50%); border-radius:10px; padding:20px; background-color:#fff; box-shadow:0px 0px 10px #888;z-index:999;flex-direction: column;";
    button_div.style = "display:flex; width:100%; justify-content:flex-end; margin-top:10px;";
    zoomeye_button.style = "display: block;background-color:#007bff; color:#fff; padding:5px 10px; border:none; border-radius:5px; width: 100%;";
    zoomeye_button.innerText = "ZoomEye Search";
    label.innerText = message;
    prompt_ele.appendChild(label);
    button_div.appendChild(zoomeye_button);
    prompt_ele.appendChild(button_div);
    document.body.appendChild(prompt_ele);

    prompt_ele.onmouseup = function(){
        prompt_ele.style="display:none"
    }

    // 在ZoomEye搜索按钮上添加事件绑定
    zoomeye_button.onmousedown = function(){
        chrome.runtime.sendMessage({
            'sign': 'regexp_zoomeye'
        }, function(res){
            prompt_ele.style= "display:none"
        });
    };
}
