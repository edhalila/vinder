function performLogin()
{
    var theUrl =  'http://cileria.com:3050/ping';//'http://localhost:8000/login';
    var data = new FormData();
    var username = document.getElementById('usernameInput').value;
    data.append('username' , username);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, true ); // false for synchronous request
    xmlHttp.send( data );
    xmlHttp.onload = function(){
        if(xmlHttp.status == '200')
        {
            var received = this.responseText;
            console.log(received);
            var content = JSON.parse(received);
            if(true)//content['error'] == 0)
            {
                console.log("login successfull");
                loginReally();
            }
            else
            {
                console.log("some error: " + content['error']);
            }
        }
    };
}

function loginReally()
{
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('uploadForm').style.display = 'block';
}