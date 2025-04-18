import os
import base64
import uuid
import time
from IPython.display import HTML, display

def get_apack_js_path():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    apack_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
    apack_js_path = os.path.join(apack_root, "dist", "apack.umd.min.js")
    
    # In production, we should import apack from unpkg.
    if not os.path.exists(apack_js_path):
        return "https://unpkg.com/apack@latest/dist/apack.umd.min.js"
    
    # Add timestamp to force browser to reload the script
    timestamp = int(time.time() * 1000)
    
    # Create a data URL for the JavaScript file
    with open(apack_js_path, 'rb') as f:
        js_content = f.read()
        js_base64 = base64.b64encode(js_content).decode('utf-8')
        data_url = f"data:text/javascript;base64,{js_base64}?v={timestamp}"
        
    return data_url

def render(text):
    data_url = get_apack_js_path()
    root_id = f"root-{uuid.uuid4()}"
    
    html_content = f"""
    <div id="{root_id}"></div>
    <script src="{data_url}"></script>
    <script>document.getElementById('{root_id}').appendChild(ap.render({repr(text)}));</script>
    """
    
    display(HTML(html_content))
    