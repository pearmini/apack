import os
import uuid
import json
from IPython.display import HTML, display

def get_apack_js():
    """Get apack.js content or URL based on environment.
    
    Returns:
        tuple: (is_dev, content_or_url)
            - is_dev: True if in development mode (local file exists)
            - content_or_url: Either the JS content (dev) or CDN URL (prod)
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    apack_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
    apack_js_path = os.path.join(apack_root, "dist", "apack.umd.min.js")
    
    # Check if we're in development (local file exists)
    if os.path.exists(apack_js_path):
        with open(apack_js_path, 'r') as f:
            return True, f.read()
    
    # Production mode - use unpkg
    return False, "https://unpkg.com/apackjs@latest/dist/apack.umd.min.js"

def render(text, options=None):
    """Render text using apack.js with optional styling options.
    
    Args:
        text (str): The text to render
        options (dict, optional): Options to pass to the render function.
            Example: {"word": {"fill": "red"}}
    """
    is_dev, js_content_or_url = get_apack_js()
    root_id = f"root-{uuid.uuid4()}"
    
    # Convert options to JSON string if provided
    options_json = json.dumps(options) if options is not None else '{}'
    
    if is_dev:
        # Development mode - inject JS directly
        html_content = f"""
        <div id="{root_id}"></div>
        <script>
        {js_content_or_url}
        document.getElementById('{root_id}').appendChild(ap.text({repr(text)}, {options_json}).render());
        </script>
        """
    else:
        # Production mode - load from CDN
        html_content = f"""
        <div id="{root_id}"></div>
        <script src="{js_content_or_url}"></script>
        <script>
        // Wait for script to load
        window.onload = () => {{
            document.getElementById('{root_id}').appendChild(ap.text({repr(text)}, {options_json}).render());
        }};
        </script>
        """
    
    display(HTML(html_content))
    