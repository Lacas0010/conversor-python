import re

html_content = open('index.html', 'r', encoding='utf-8').read()

new_style = """
    <style>
        * {
            box-sizing: border-box;
            --md-sys-shape-corner-extra-large: 24px;
            --md-sys-shape-corner-large: 16px;
            --md-sys-shape-corner-medium: 12px;
            --md-sys-shape-corner-small: 8px;
            --md-filled-button-container-shape: 16px;
            --md-outlined-text-field-container-shape: 12px;
            --md-outlined-select-container-shape: 12px;
        }

        :root {
            /* Hyper-Glass Palette */
            --bg-base: #050508;
            --glass-bg: rgba(20, 20, 24, 0.4);
            --glass-border: rgba(255, 255, 255, 0.06);
            --glass-highlight: rgba(255, 255, 255, 0.1);
            
            --md-sys-color-background: transparent;
            --md-sys-color-on-background: #f8fafc;
            --md-sys-color-surface: var(--glass-bg);
            --md-sys-color-on-surface: #f8fafc;
            --md-sys-color-surface-container-low: rgba(0, 0, 0, 0.2);
            --md-sys-color-surface-container: var(--glass-bg);
            --md-sys-color-surface-container-high: rgba(255, 255, 255, 0.05);
            --md-sys-color-surface-variant: rgba(255, 255, 255, 0.03);
            --md-sys-color-on-surface-variant: #94a3b8;
            --md-sys-color-primary: #38bdf8;
            --md-sys-color-on-primary: #020617;
            --md-sys-color-outline: rgba(255, 255, 255, 0.15);
            --md-sys-color-error: #f43f5e;
            --md-sys-color-on-error: #ffffff;
            
            --glow-primary: rgba(56, 189, 248, 0.3);
            --glow-secondary: rgba(168, 85, 247, 0.25);
            --glow-accent: rgba(236, 72, 153, 0.2);
        }

        body {
            background-color: var(--bg-base);
            color: var(--md-sys-color-on-background);
            font-family: 'Inter', 'Segoe UI Variable', 'Segoe UI', 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
            position: relative;
        }

        /* Ambient Orbs */
        .ambient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(140px);
            opacity: 0.8;
            z-index: 0;
            animation: float 20s ease-in-out infinite alternate;
            pointer-events: none;
        }

        .orb-1 {
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, var(--glow-primary) 0%, transparent 70%);
            top: -200px;
            left: -100px;
        }

        .orb-2 {
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, var(--glow-secondary) 0%, transparent 70%);
            bottom: -300px;
            right: -100px;
            animation-delay: -10s;
        }

        .orb-3 {
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, var(--glow-accent) 0%, transparent 70%);
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation-duration: 25s;
        }

        @keyframes float {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(40px, -60px) scale(1.1); }
        }

        /* App Container */
        .app-container {
            display: flex;
            height: 100vh;
            width: 100vw;
            position: relative;
            z-index: 1; /* Above orbs */
            padding: 24px;
            gap: 24px;
            box-sizing: border-box;
        }

        /* Floating Sidebar */
        .navigation-rail {
            width: 80px;
            background-color: var(--glass-bg);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 32px 0;
            flex-shrink: 0;
            box-shadow: 0 24px 48px rgba(0,0,0,0.4);
            height: 100%;
        }

        .app-logo {
            width: 44px;
            height: 44px;
            object-fit: contain;
            filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.6));
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .app-logo:hover {
            transform: scale(1.15) rotate(-10deg);
        }

        .rail-items {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .rail-btn {
            width: 52px;
            height: 52px;
            border-radius: 16px; 
            border: 1px solid transparent;
            background-color: transparent;
            color: var(--md-sys-color-on-surface-variant);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .rail-btn span {
            font-family: 'Material Symbols Outlined';
            font-size: 26px;
        }

        .rail-btn:hover {
            background-color: var(--glass-highlight);
            color: #ffffff;
            transform: translateY(-2px);
        }

        .rail-btn.active {
            background-color: rgba(56, 189, 248, 0.1);
            border: 1px solid rgba(56, 189, 248, 0.3);
            border-radius: 16px;
            color: var(--md-sys-color-primary);
            box-shadow: 0 8px 16px rgba(0,0,0,0.2), inset 0 0 12px rgba(56, 189, 248, 0.1);
        }

        .rail-footer span {
            font-family: 'Material Symbols Outlined';
            font-size: 24px;
            color: #34d399;
            text-shadow: 0 0 16px rgba(52, 211, 153, 0.5);
        }

        /* Main Content Panel */
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            min-width: 0; 
            height: 100%;
        }

        .container {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            width: 100%;
            height: 100%;
        }

        /* SPA Views Management */
        .view { display: none; height: 100%; }
        .view.active { display: flex; flex-direction: column; animation: fadeInScale 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }

        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.98) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .dashboard-card {
            background: transparent;
            border: none;
            padding: 0;
            margin: 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }

        header {
            padding-bottom: 24px;
            margin-bottom: 24px;
            flex-shrink: 0;
            border-bottom: 1px solid var(--glass-border);
        }

        header h1 {
            font-size: 36px;
            font-weight: 700;
            background: linear-gradient(90deg, #38bdf8, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 16px;
            letter-spacing: -1px;
        }

        header h1 span.icon {
            font-family: 'Material Symbols Outlined';
            font-size: 40px;
            background: none;
            -webkit-text-fill-color: initial;
            color: var(--md-sys-color-primary);
            text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
        }

        header p {
            font-size: 16px;
            color: var(--md-sys-color-on-surface-variant);
            margin: 0;
        }

        /* Workspace & Inspector Split Layout */
        .app-split-layout {
            display: flex;
            gap: 24px;
            flex: 1;
            height: 100%;
            overflow: hidden;
        }

        .workspace-pane {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 24px;
            overflow-y: auto;
            padding-right: 8px;
        }

        .workspace-pane::-webkit-scrollbar { width: 6px; }
        .workspace-pane::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        .inspector-pane {
            width: 360px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            gap: 24px;
            background-color: var(--glass-bg);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border-radius: 24px;
            padding: 32px;
            border: 1px solid var(--glass-border);
            box-shadow: 0 24px 48px rgba(0,0,0,0.3);
            overflow-y: auto;
            position: relative;
        }

        /* Dropzone Gigante */
        .dropzone {
            flex: 1;
            min-height: 300px;
            border: 2px dashed rgba(255, 255, 255, 0.15);
            border-radius: 24px;
            background-color: rgba(255, 255, 255, 0.02);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .dropzone::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at center, rgba(56, 189, 248, 0.1) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
        }

        .dropzone:hover, .dropzone.dragover {
            border-color: rgba(56, 189, 248, 0.5);
            background-color: rgba(56, 189, 248, 0.05);
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .dropzone:hover::before, .dropzone.dragover::before {
            opacity: 1;
        }

        .dropzone span.upload-icon {
            font-family: 'Material Symbols Outlined';
            font-size: 64px;
            color: var(--md-sys-color-primary);
            margin-bottom: 24px;
            transition: transform 0.4s ease;
        }

        .dropzone:hover span.upload-icon {
            transform: translateY(-8px) scale(1.1);
            text-shadow: 0 0 32px rgba(56, 189, 248, 0.6);
        }

        .dropzone .primary-text {
            font-size: 20px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 12px;
            position: relative;
        }

        .dropzone .secondary-text {
            font-size: 15px;
            color: var(--md-sys-color-on-surface-variant);
            position: relative;
        }

        /* Fila de Arquivos: Chips Flutuantes */
        #file-queue {
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-height: 300px;
            overflow-y: auto;
            padding-right: 8px;
        }
        
        #file-queue::-webkit-scrollbar { width: 6px; }
        #file-queue::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        .queue-item {
            background-color: rgba(255, 255, 255, 0.04);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.3s;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .queue-item:hover {
            background-color: rgba(255, 255, 255, 0.08);
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.15);
        }

        .queue-item-info {
            display: flex;
            align-items: center;
            gap: 16px;
            min-width: 0;
        }

        .queue-item-info span.file-icon {
            font-family: 'Material Symbols Outlined';
            font-size: 28px;
            color: #a855f7;
            text-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
        }

        .queue-item-meta {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .queue-item-name {
            font-size: 15px;
            font-weight: 600;
            color: #ffffff;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .queue-item-size {
            font-size: 12px;
            color: var(--md-sys-color-on-surface-variant);
        }

        .remove-icon-btn {
            cursor: pointer;
            color: var(--md-sys-color-error);
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: 50%;
            transition: background-color 0.2s;
        }

        .remove-icon-btn:hover {
            background-color: rgba(244, 63, 94, 0.15);
            color: #fb7185;
        }

        .remove-icon-btn span {
            font-family: 'Material Symbols Outlined';
            font-size: 22px;
        }

        /* Config Controls */
        .config-bar {
            display: flex;
            flex-direction: column; 
            gap: 20px;
            margin: 0;
        }

        .config-bar md-outlined-select,
        .config-bar md-outlined-text-field {
            width: 100%; 
            flex: none;
        }

        /* Progress Wrapper */
        .progress-wrapper {
            display: none;
            margin-bottom: 24px;
            background: rgba(0,0,0,0.2);
            padding: 16px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .progress-label {
            font-size: 13px;
            color: #ffffff;
            margin-bottom: 12px;
            font-weight: 500;
        }

        /* Action layout */
        .actions {
            margin-top: auto; 
            display: flex;
            flex-direction: column;
        }

        .actions md-filled-button {
            width: 100%; 
            height: 64px;
            --md-filled-button-container-color: var(--md-sys-color-primary);
            --md-filled-button-label-text-color: var(--md-sys-color-on-primary);
            --md-filled-button-label-text-font: 'Inter';
            box-shadow: 0 12px 24px rgba(56, 189, 248, 0.3);
            transition: all 0.3s;
        }

        .actions md-filled-button:hover {
            box-shadow: 0 16px 32px rgba(56, 189, 248, 0.5);
            transform: translateY(-2px);
        }

        /* Hidden standard file input */
        #file-input {
            display: none;
        }

        /* Alert notifications */
        .status-alert {
            display: none;
            padding: 16px;
            border-radius: 12px;
            margin-top: 24px;
            font-size: 14px;
            line-height: 1.5;
            backdrop-filter: blur(10px);
        }

        .status-alert.success {
            background-color: rgba(52, 211, 153, 0.15);
            border: 1px solid #34d399;
            color: #a7f3d0;
        }

        .settings-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--md-sys-color-on-surface);
        }

        .settings-desc {
            font-size: 13px;
            color: var(--md-sys-color-on-surface-variant);
        }

        /* History styles */
        .history-list {
            background-color: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 16px;
        }

        .history-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .history-item:last-child {
            border-bottom: none;
        }

        .history-meta {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .history-meta span.status-icon {
            font-family: 'Material Symbols Outlined';
            font-size: 28px;
            color: #a855f7;
        }

        .history-details div.name {
            font-size: 15px;
            font-weight: 500;
            color: #ffffff;
        }

        .history-details div.date {
            font-size: 13px;
            color: var(--md-sys-color-on-surface-variant);
        }

        /* Terminal Layout Styles */
        .dashboard-layout {
            display: flex;
            gap: 24px;
            height: 100%;
            align-items: flex-start;
        }

        .dashboard-layout .dashboard-card {
            flex: 1;
            min-width: 0;
        }

        #terminal-container {
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 24px;
            width: 400px;
            flex-shrink: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--glass-border);
            box-shadow: 0 24px 48px rgba(0,0,0,0.5);
        }

        #terminal-container h3 {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 15px;
            color: var(--md-sys-color-on-surface-variant);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        #terminal-output {
            flex: 1;
            overflow-y: auto;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            color: #4ADE80;
            padding-right: 8px;
        }

        #terminal-output::-webkit-scrollbar { width: 6px; }
        #terminal-output::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        #terminal-output div {
            word-wrap: break-word;
            white-space: pre-wrap;
            line-height: 1.6;
            margin-bottom: 4px;
        }

        .hidden {
            display: none !important;
        }

        .log-info { color: #38bdf8; }
        .log-warning { color: #facc15; }
        .log-error { color: #f43f5e; }
        .log-neutral { color: #94a3b8; }
    </style>
"""

# Replace entire style block
style_pattern = re.compile(r'<style>.*?</style>', re.DOTALL)
html_content = style_pattern.sub(new_style, html_content)

# Add orbs and wrap body contents in app-container
# Find the start of navigation-rail which comes directly after body
new_body_start = """<body>
    <!-- Ambient Orbs -->
    <div class="ambient-orb orb-1"></div>
    <div class="ambient-orb orb-2"></div>
    <div class="ambient-orb orb-3"></div>

    <div class="app-container">
        <!-- M3 Navigation Rail -->
        <div class="navigation-rail">"""

html_content = html_content.replace('<body>\n\n    <!-- M3 Navigation Rail -->\n    <div class="navigation-rail">', new_body_start)

# Add closing div for app-container just before script tags
script_idx = html_content.rfind('    <script>')
if script_idx != -1:
    html_content = html_content[:script_idx] + '    </div>\n' + html_content[script_idx:]

open('index.html', 'w', encoding='utf-8').write(html_content)
print("Updated successfully")
