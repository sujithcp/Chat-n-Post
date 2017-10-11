function sendXhr(method, url, data, cb){
    console.log(method + " " + url)
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(data)
    xhr.onreadystatechange = function(e) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var response = xhr.response
                cb(response)
                return
            }
            console.log("Null response from server")
            cb(null)
        }

    };
}