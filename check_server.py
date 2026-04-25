import urllib.request

# 检查根路径
print('=== 检查根路径 ===')
try:
    resp = urllib.request.urlopen('http://localhost:8888/')
    print('Status:', resp.status)
    print('Content-Type:', resp.headers.get('Content-Type'))
    content = resp.read().decode('utf-8', errors='ignore')
    print('\n最后 500 字符:')
    print(content[-500:])
    
    # 查找 script 标签
    print('\nScript 标签:')
    import re
    scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', content)
    for script in scripts:
        print(f'  - {script}')
        
    # 检查是否包含 Vite 相关内容
    if '@vite/client' in content:
        print('\n⚠️  发现 Vite 相关内容')
except Exception as e:
    print('Error:', e)

# 检查 js 文件
print('\n=== 检查 JS 文件 ===')
js_files = ['js/md5.js', 'js/config.js', 'js/api.js', 'js/ui.js', 'js/app.js']
for js_file in js_files:
    try:
        resp = urllib.request.urlopen(f'http://localhost:8888/{js_file}')
        print(f'{js_file}: Status {resp.status}, Length {resp.headers.get("Content-Length")}')
    except Exception as e:
        print(f'{js_file}: Error {e}')
