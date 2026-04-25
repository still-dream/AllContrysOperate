#!/usr/bin/env python3
import os
import sys
import json
import socket
import threading
import http.server
import socketserver
import urllib3

os.environ['HTTP_PROXY'] = ''
os.environ['HTTPS_PROXY'] = ''
os.environ['http_proxy'] = ''
os.environ['https_proxy'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''

import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

PORT = 8888
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
CONFIG_FILE = os.path.join(BASE_DIR, 'AllContrysOperate.json')


def load_country_configs():
    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f'加载国家配置失败: {e}')
        return {}


COUNTRY_CONFIGS = load_country_configs()


class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, authtoken, user-agent, token, App-Version, App-Platform, devicefrom')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/countries':
            self._handle_get_countries()
        else:
            self._serve_frontend()

    def do_POST(self):
        if self.path == '/api/proxy':
            self._handle_proxy()
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode('utf-8'))

    def _handle_get_countries(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(COUNTRY_CONFIGS, ensure_ascii=False).encode('utf-8'))

    def _handle_proxy(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 10 * 1024 * 1024:
                self.send_response(413)
                self.end_headers()
                return

            post_data = self.rfile.read(content_length) if content_length > 0 else b''
            proxy_data = json.loads(post_data.decode('utf-8'))

            target_url = proxy_data['url']
            method = proxy_data.get('method', 'POST')
            headers = proxy_data.get('headers', {})
            body = proxy_data.get('body')

            request_kwargs = {
                'method': method,
                'url': target_url,
                'headers': headers,
                'timeout': 30,
                'verify': False,
                'proxies': {'http': None, 'https': None}
            }

            if body is not None:
                if body.get('__type') == 'FormData':
                    request_kwargs['data'] = body.get('data', {})
                    if 'content-type' in headers:
                        del headers['content-type']
                    if 'Content-Type' in headers:
                        del headers['Content-Type']
                elif isinstance(body, (dict, list)):
                    request_kwargs['json'] = body
                elif isinstance(body, str):
                    request_kwargs['data'] = body

            resp = requests.request(**request_kwargs)

            self.send_response(resp.status_code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            try:
                response_json = resp.json()
                self.wfile.write(json.dumps(response_json, ensure_ascii=False).encode('utf-8'))
            except Exception:
                self.wfile.write(resp.content)

        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def _serve_frontend(self):
        # 移除URL查询参数
        path_without_query = self.path.split('?')[0]
        if path_without_query == '/' or path_without_query == '/index.html':
            file_path = os.path.join(FRONTEND_DIR, 'index.html')
        else:
            file_path = os.path.join(FRONTEND_DIR, path_without_query.lstrip('/'))

        if os.path.isfile(file_path):
            ext = os.path.splitext(file_path)[1].lower()
            content_types = {
                '.html': 'text/html; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.js': 'application/javascript; charset=utf-8',
                '.json': 'application/json; charset=utf-8',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            }
            content_type = content_types.get(ext, 'application/octet-stream')

            with open(file_path, 'rb') as f:
                content = f.read()

            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'<h1>404 Not Found</h1>')

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


if __name__ == "__main__":
    local_ip = get_local_ip()

    print("=" * 60)
    print("物流扫描工具服务器已启动 (前后端分离版)")
    print("=" * 60)
    print(f"本机访问:    http://localhost:{PORT}")
    print(f"局域网访问:  http://{local_ip}:{PORT}")
    print("=" * 60)
    print("API 接口:")
    print(f"  GET  /api/countries  - 获取国家配置")
    print(f"  POST /api/proxy      - 代理转发请求")
    print("=" * 60)
    print("前端文件目录: frontend/")
    print("配置文件:     AllContrysOperate.json")
    print("=" * 60)
    print(f"按 Ctrl+C 停止服务器")
    print("=" * 60)

    try:
        with ThreadedTCPServer(("0.0.0.0", PORT), ProxyHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
