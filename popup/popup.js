let grafama_submit = document.getElementById("grafama_submit");
grafama_submit.onclick= function(){
    let grafama_input = document.getElementById('grafama_input');
    console.log(grafama_input.value);
    let loading = document.getElementById('loading');
    loading.style.display='flex';
    let p = document.getElementById('gpt_output');
    p.style.display='none';

    chrome.runtime.sendMessage({
        sign: 'grafama',
        grafama_input_value: grafama_input.value
    }, function(res){
        console.log('popup recived')
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.sign == 'grafama'){
        set_output_element(message.gpt_res);
    }
    sendResponse(`popup ok ${message}`);
});

function set_output_element(result){
    let out = document.getElementById('gpt_output');
    out.value = result;
    let loading = document.getElementById('loading');
    loading.style.display = 'none';
    out.style.display = "block";
    out.addEventListener('change', (event) => {
        a(event.target.value);
    });
    a(result);
}

function a(result){
    let a = document.getElementById('zoomeye_link');
    a.href = `https://www.zoomeye.org/searchResult?q=${encodeURIComponent(result)}`;
    a.style.display = "block";
}
