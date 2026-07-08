import re

html_content = open('index.html', 'r', encoding='utf-8').read()

# Change @media prefers-color-scheme to :root.light-theme
html_content = html_content.replace(
    "@media (prefers-color-scheme: light) {\n            :root {",
    ":root.light-theme {"
)
html_content = html_content.replace(
    "                --glow-accent: rgba(219, 39, 119, 0.1);\n            }\n        }",
    "                --glow-accent: rgba(219, 39, 119, 0.1);\n            }"
)

# Update rail-footer with button
old_footer = """        <div class="rail-footer" title="100% Offline">
            <span>offline_bolt</span>
        </div>"""

new_footer = """        <div class="rail-footer" style="display:flex; flex-direction:column; gap:16px;">
            <button class="rail-btn" id="theme-toggle" title="Alternar Tema">
                <span id="theme-icon">light_mode</span>
            </button>
            <div title="100% Offline" style="display:flex; justify-content:center;">
                <span style="font-family: 'Material Symbols Outlined'; font-size: 24px; color: #34d399; text-shadow: 0 0 16px rgba(52, 211, 153, 0.5);">offline_bolt</span>
            </div>
        </div>"""

html_content = html_content.replace(old_footer, new_footer)

# Add JS logic for the toggle
js_logic = """
        // Theme toggle logic
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        // Initial check
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.classList.add('light-theme');
            themeIcon.textContent = 'dark_mode';
        }

        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-theme');
            if (document.documentElement.classList.contains('light-theme')) {
                themeIcon.textContent = 'dark_mode';
            } else {
                themeIcon.textContent = 'light_mode';
            }
        });
"""

# Insert JS logic before connection logic
if '// Conexão WebSocket para Logs' in html_content:
    html_content = html_content.replace('// Conexão WebSocket para Logs', js_logic + '\n        // Conexão WebSocket para Logs')
else:
    # Fallback if connection logic is not found
    html_content = html_content.replace('</script>\n</body>', js_logic + '\n</script>\n</body>')

open('index.html', 'w', encoding='utf-8').write(html_content)
print("Manual toggle added")
