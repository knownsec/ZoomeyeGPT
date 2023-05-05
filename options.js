let save_option = document.getElementById('save_option');
save_option.onclick = () => {
    const api_key = document.getElementById('input-field').value;
    chrome.storage.local.set(
      { APIKEY: api_key}
    );
};

let delete_option = document.getElementById('delete_option');
delete_option.onclick =  () => {
    chrome.storage.local.remove(
      "APIKEY"
    );
}

let show_option = document.getElementById('show_option');
show_option.onclick = () => {
    chrome.storage.local.get('APIKEY').then(
        APIKEY => {
          if(APIKEY && APIKEY.APIKEY!=undefined){
            alert(APIKEY.APIKEY);
          }
        }
    );
}
