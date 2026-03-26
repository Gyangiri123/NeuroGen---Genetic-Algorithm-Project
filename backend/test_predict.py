import requests
url = 'http://127.0.0.1:5000/predict'
with open('backend/mnist_noisy/test/9/img_00496.png','rb') as f:
    files = {'file': f}
    r = requests.post(url, files=files, timeout=10)
    print(r.status_code)
    print(r.text)
