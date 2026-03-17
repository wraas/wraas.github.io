"""Local dev server that mimics GitHub Pages 404 behavior.

Any request for a path that doesn't match a file or directory index
serves docs/404.html, just like GitHub Pages does.
"""

import http.server
import os
import sys
from functools import partial


class GitHubPagesHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.send_custom_404()
        else:
            super().send_error(code, message, explain)

    def send_custom_404(self):
        four_oh_four = os.path.join(self.directory, "404.html")
        if os.path.isfile(four_oh_four):
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            with open(four_oh_four, "rb") as f:
                content = f.read()
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            super().send_error(404)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    directory = sys.argv[2] if len(sys.argv) > 2 else "docs"

    handler = partial(GitHubPagesHandler, directory=os.path.abspath(directory))

    with http.server.HTTPServer(("", port), handler) as httpd:
        print(f"Serving {directory}/ at http://localhost:{port} (GitHub Pages mode)")
        httpd.serve_forever()
