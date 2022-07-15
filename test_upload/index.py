import requests

Session = requests.Session()

r = Session.post("http://192.168.1.69:3000/api/v1/upload/", files={'xclouduploadservice': open("../public/ico/logo.png",'rb')})

if r.status_code == 200:
    print(r.text)
else:
    print(r.text, r.status_code)
