import re

html_content = open('index.html', 'r', encoding='utf-8').read()

# Insert the light mode palette
light_mode_css = """
        @media (prefers-color-scheme: light) {
            :root {
                --bg-base: #f1f5f9;
                --glass-bg: rgba(255, 255, 255, 0.6);
                --glass-border: rgba(0, 0, 0, 0.1);
                --glass-highlight: rgba(0, 0, 0, 0.05);
                
                --md-sys-color-on-background: #0f172a;
                --md-sys-color-surface: var(--glass-bg);
                --md-sys-color-on-surface: #0f172a;
                --md-sys-color-surface-container-low: rgba(255, 255, 255, 0.8);
                --md-sys-color-surface-container: var(--glass-bg);
                --md-sys-color-surface-container-high: rgba(0, 0, 0, 0.08);
                --md-sys-color-surface-variant: rgba(0, 0, 0, 0.05);
                --md-sys-color-on-surface-variant: #475569;
                --md-sys-color-primary: #0284c7;
                --md-sys-color-on-primary: #ffffff;
                --md-sys-color-outline: rgba(0, 0, 0, 0.2);
                
                --glow-primary: rgba(2, 132, 199, 0.15);
                --glow-secondary: rgba(147, 51, 234, 0.12);
                --glow-accent: rgba(219, 39, 119, 0.1);
            }
        }
"""

# Find the end of :root block
root_end_idx = html_content.find('}\n\n        body {')
if root_end_idx != -1:
    html_content = html_content[:root_end_idx+1] + light_mode_css + html_content[root_end_idx+1:]

# Fix hardcoded colors
replacements = {
    'color: #ffffff;': 'color: var(--md-sys-color-on-surface);',
    'color: #f8fafc;': 'color: var(--md-sys-color-on-surface);',
    'background-color: rgba(0, 0, 0, 0.6);': 'background-color: var(--md-sys-color-surface-container-low);',
    'color: #ffffff; /*': 'color: var(--md-sys-color-on-surface); /*',
    'border: 2px dashed rgba(255, 255, 255, 0.15);': 'border: 2px dashed var(--md-sys-color-outline);',
    'border: 1px solid rgba(255, 255, 255, 0.08);': 'border: 1px solid var(--glass-border);',
    'background-color: rgba(255, 255, 255, 0.02);': 'background-color: var(--md-sys-color-surface-variant);',
    'background-color: rgba(255, 255, 255, 0.04);': 'background-color: var(--md-sys-color-surface-variant);',
    'background-color: rgba(255, 255, 255, 0.08);': 'background-color: var(--glass-highlight);',
    'border-color: rgba(255, 255, 255, 0.15);': 'border-color: var(--glass-border);',
    'border-bottom: 1px solid rgba(255, 255, 255, 0.05);': 'border-bottom: 1px solid var(--glass-border);',
    'background: rgba(0,0,0,0.2);': 'background: var(--md-sys-color-surface-container-low);',
    'border: 1px solid rgba(255,255,255,0.05);': 'border: 1px solid var(--glass-border);'
}

for old, new in replacements.items():
    html_content = html_content.replace(old, new)

open('index.html', 'w', encoding='utf-8').write(html_content)
print("Light mode added")
