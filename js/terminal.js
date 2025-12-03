// Terminal Easter Egg Mode
(function() {
    'use strict';

    const Terminal = {
        active: false,
        container: null,
        output: null,
        input: null,
        commandHistory: [],
        historyIndex: -1,
        currentPath: '~',

        commands: {
            help: {
                desc: 'Show available commands',
                exec: function() {
                    let help = '<div class="term-help">';
                    help += '<strong>Available Commands:</strong><br><br>';
                    for (let cmd in Terminal.commands) {
                        help += `<span class="term-cmd">${cmd}</span> - ${Terminal.commands[cmd].desc}<br>`;
                    }
                    help += '</div>';
                    return help;
                }
            },
            about: {
                desc: 'About Vedant',
                exec: function() {
                    return `
                        <div class="term-section">
                            <strong>Vedant Khairnar</strong><br>
                            🥑 Developer Avocado | Spreading Good Vibes & Code<br><br>
                            Role: Developer Advocate<br>
                            Passion: Community, AI, Cloud<br>
                            Motto: "Use your Brain as a Processor, not as a HardDisk!"
                        </div>
                    `;
                }
            },
            skills: {
                desc: 'List technical skills',
                exec: function() {
                    return `
                        <div class="term-skills">
                            <strong>Technical Skills:</strong><br>
                            [████████████████████] JavaScript/TypeScript<br>
                            [███████████████████ ] Python<br>
                            [███████████████████ ] React/Node.js<br>
                            [██████████████████  ] Cloud (AWS/Azure)<br>
                            [█████████████████   ] AI/ML<br>
                            [██████████████████  ] DevOps<br>
                        </div>
                    `;
                }
            },
            projects: {
                desc: 'View projects',
                exec: function() {
                    return `
                        <div class="term-projects">
                            <strong>Featured Projects:</strong><br><br>
                            1. Community Platform - Built with ❤️<br>
                            2. AI Integration Tools - Cutting edge<br>
                            3. Open Source Contributions - Active maintainer<br><br>
                            <em>Scroll down on the main site to see more!</em>
                        </div>
                    `;
                }
            },
            contact: {
                desc: 'Get contact information',
                exec: function() {
                    return `
                        <div class="term-contact">
                            <strong>Contact Info:</strong><br>
                            📧 Email: vedron007@gmail.com<br>
                            🐙 GitHub: github.com/VedantKhairnar<br>
                            🐦 Twitter: @VedantKhairnar3<br>
                            💼 LinkedIn: linkedin.com/in/vedantkhairnar<br>
                        </div>
                    `;
                }
            },
            'particle-explode': {
                desc: 'Make particles explode',
                exec: function() {
                    if (window.ScrollParticles) {
                        window.ScrollParticles.explode();
                        return '<span class="term-success">💥 BOOM! Particles exploded!</span>';
                    }
                    return '<span class="term-error">Particle system not available</span>';
                }
            },
            'particle-freeze': {
                desc: 'Freeze all particles',
                exec: function() {
                    if (window.ScrollParticles) {
                        window.ScrollParticles.freeze();
                        return '<span class="term-success">❄️ Particles frozen!</span>';
                    }
                    return '<span class="term-error">Particle system not available</span>';
                }
            },
            'particle-rainbow': {
                desc: 'Rainbow particles',
                exec: function() {
                    if (window.ScrollParticles) {
                        const colors = ['rgba(255,0,0,0.6)', 'rgba(255,127,0,0.6)', 'rgba(255,255,0,0.6)', 
                                      'rgba(0,255,0,0.6)', 'rgba(0,0,255,0.6)', 'rgba(75,0,130,0.6)', 'rgba(148,0,211,0.6)'];
                        let i = 0;
                        const interval = setInterval(() => {
                            window.ScrollParticles.setColor(colors[i % colors.length]);
                            i++;
                            if (i > 20) clearInterval(interval);
                        }, 200);
                        return '<span class="term-success">🌈 Rainbow mode activated!</span>';
                    }
                    return '<span class="term-error">Particle system not available</span>';
                }
            },
            matrix: {
                desc: 'Enter the Matrix',
                exec: function() {
                    if (window.ScrollParticles) {
                        window.ScrollParticles.setColor('rgba(0,255,0,0.8)');
                    }
                    return `
                        <div class="term-matrix">
                            <span style="color: #0f0;">Wake up, Neo...</span><br>
                            <span style="color: #0f0;">The Matrix has you...</span><br>
                            <span style="color: #0f0;">Follow the white rabbit 🐰</span>
                        </div>
                    `;
                }
            },
            clear: {
                desc: 'Clear terminal screen',
                exec: function() {
                    Terminal.output.innerHTML = '';
                    return null;
                }
            },
            exit: {
                desc: 'Exit terminal mode',
                exec: function() {
                    Terminal.close();
                    return null;
                }
            },
            whoami: {
                desc: 'Display current user',
                exec: function() {
                    return 'vedant@portfolio:~$';
                }
            },
            date: {
                desc: 'Show current date',
                exec: function() {
                    return new Date().toString();
                }
            }
        },

        init: function() {
            // Create terminal container
            this.container = document.createElement('div');
            this.container.id = 'terminal-mode';
            this.container.innerHTML = `
                <div class="terminal-window">
                    <div class="terminal-header">
                        <div class="terminal-buttons">
                            <span class="term-btn term-close"></span>
                            <span class="term-btn term-minimize"></span>
                            <span class="term-btn term-maximize"></span>
                        </div>
                        <div class="terminal-title">vedant@portfolio:~</div>
                    </div>
                    <div class="terminal-body">
                        <div class="terminal-output" id="term-output">
                            <div class="term-welcome">
                                <div style="color: #00ff00; font-size: 20px; font-weight: bold; margin-bottom: 10px;">
                                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
                                    &nbsp;&nbsp;Vedant Khairnar | Developer Terminal v1.0<br>
                                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                </div><br>
                                Welcome to the terminal! Type <span class="term-cmd">help</span> for available commands.<br>
                                Type <span class="term-cmd">exit</span> to return to normal mode.<br><br>
                            </div>
                        </div>
                        <div class="terminal-input-line">
                            <span class="terminal-prompt">vedant@portfolio:~$</span>
                            <input type="text" class="terminal-input" id="term-input" autocomplete="off" spellcheck="false">
                        </div>
                    </div>
                </div>
            `;

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                #terminal-mode {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 10000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    animation: termFadeIn 0.3s ease-out;
                }
                @keyframes termFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .terminal-window {
                    width: 90%;
                    max-width: 1000px;
                    height: 80%;
                    background: #1e1e1e;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 10px 50px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                    font-family: 'Courier New', monospace;
                }
                .terminal-header {
                    background: #2d2d2d;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .terminal-buttons {
                    display: flex;
                    gap: 8px;
                }
                .term-btn {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .term-close { background: #ff5f56; }
                .term-minimize { background: #ffbd2e; }
                .term-maximize { background: #27c93f; }
                .term-close:hover { background: #ff0000; }
                .terminal-title {
                    color: #ccc;
                    font-size: 14px;
                }
                .terminal-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .terminal-output {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    color: #0f0;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .terminal-output::-webkit-scrollbar {
                    width: 8px;
                }
                .terminal-output::-webkit-scrollbar-track {
                    background: #1e1e1e;
                }
                .terminal-output::-webkit-scrollbar-thumb {
                    background: #444;
                    border-radius: 4px;
                }
                .terminal-input-line {
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #1a1a1a;
                }
                .terminal-prompt {
                    color: #0f0;
                    font-weight: bold;
                }
                .terminal-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    caret-color: #0f0;
                }
                .term-welcome {
                    color: #00ff00;
                    margin-bottom: 20px;
                }
                .term-cmd {
                    color: #00ffff;
                    font-weight: bold;
                }
                .term-success {
                    color: #00ff00;
                }
                .term-error {
                    color: #ff0000;
                }
                .term-section, .term-skills, .term-projects, .term-contact {
                    margin: 10px 0;
                    color: #fff;
                }
                .term-help {
                    color: #fff;
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(this.container);

            this.output = document.getElementById('term-output');
            this.input = document.getElementById('term-input');

            // Event listeners
            this.input.addEventListener('keydown', this.handleInput.bind(this));
            document.querySelector('.term-close').addEventListener('click', () => this.close());

            console.log('Terminal initialized');
        },

        open: function() {
            if (!this.container) this.init();
            this.container.style.display = 'flex';
            this.active = true;
            setTimeout(() => this.input.focus(), 100);
        },

        close: function() {
            this.container.style.display = 'none';
            this.active = false;
        },

        handleInput: function(e) {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                if (command) {
                    this.executeCommand(command);
                    this.commandHistory.push(command);
                    this.historyIndex = this.commandHistory.length;
                }
                this.input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.input.value = this.commandHistory[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = this.commandHistory.length;
                    this.input.value = '';
                }
            }
        },

        executeCommand: function(cmd) {
            // Add command to output
            this.output.innerHTML += `<div><span class="terminal-prompt">vedant@portfolio:~$</span> ${cmd}</div>`;

            // Parse command
            const parts = cmd.split(' ');
            const baseCmd = parts[0].toLowerCase();

            if (this.commands[baseCmd]) {
                const result = this.commands[baseCmd].exec(parts.slice(1));
                if (result !== null) {
                    this.output.innerHTML += `<div>${result}</div>`;
                }
            } else {
                this.output.innerHTML += `<div class="term-error">Command not found: ${baseCmd}. Type 'help' for available commands.</div>`;
            }

            // Scroll to bottom
            this.output.scrollTop = this.output.scrollHeight;
        }
    };

    // Hidden trigger - press Ctrl + `
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === '`') {
            e.preventDefault();
            Terminal.open();
        } else if (e.key === 'Escape' && Terminal.active) {
            Terminal.close();
        }
    });

    // Secret keyboard trigger - type "terminal" anywhere
    let secretBuffer = '';
    document.addEventListener('keypress', function(e) {
        if (Terminal.active) return;
        secretBuffer += e.key;
        if (secretBuffer.length > 8) {
            secretBuffer = secretBuffer.slice(-8);
        }
        if (secretBuffer.includes('terminal')) {
            Terminal.open();
            secretBuffer = '';
        }
    });

    // Expose to window
    window.Terminal = Terminal;

})();
