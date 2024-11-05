document.addEventListener('DOMContentLoaded', () => {
    const codeController = {
        highlights: document.querySelectorAll('.highlight'),
        
        createButton(text, className, clickHandler) {
            const button = document.createElement('button');
            button.textContent = text;
            button.className = className;
            button.addEventListener('click', clickHandler);
            return button;
        },

        async copyCode(code, button) {
            try {
                await navigator.clipboard.writeText(code);
                const originalText = button.textContent;
                button.textContent = '已复制!';
                button.style.background = 'rgba(var(--primary-color-rgb), 0.2)';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'rgba(255, 255, 255, 0.1)';
                }, 2000);
            } catch (err) {
                console.error('复制失败:', err);
                button.textContent = '复制失败';
                button.style.background = 'rgba(255, 56, 96, 0.2)';
                
                setTimeout(() => {
                    button.textContent = '复制';
                    button.style.background = 'rgba(255, 255, 255, 0.1)';
                }, 2000);
            }
        },

        toggleFold(block, button) {
            block.classList.toggle('folded');
            if (block.classList.contains('folded')) {
                button.textContent = '展开';
                block.querySelector('pre').style.maxHeight = '200px';
            } else {
                button.textContent = '折叠';
                block.querySelector('pre').style.maxHeight = block.querySelector('pre').scrollHeight + 'px';
            }
        },

        initializeCodeBlock(block) {
            // 设置语言标识
            const lang = block.querySelector('code')?.className.split('-')[1];
            if (lang) {
                block.setAttribute('data-lang', lang);
            }

            // 创建按钮容器
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'highlight-buttons';

            // 添加复制按钮
            const copyButton = this.createButton('复制', 'copy-button', (e) => {
                e.stopPropagation();
                const code = block.querySelector('code')?.textContent || '';
                this.copyCode(code, copyButton);
            });

            // 添加折叠按钮
            const foldButton = this.createButton('展开', 'fold-button', (e) => {
                e.stopPropagation();
                this.toggleFold(block, foldButton);
            });

            buttonContainer.appendChild(copyButton);
            buttonContainer.appendChild(foldButton);
            block.appendChild(buttonContainer);

            // 默认折叠
            block.classList.add('folded');
        },

        init() {
            if (!this.highlights.length) return;
            
            this.highlights.forEach(block => this.initializeCodeBlock(block));
        }
    };

    codeController.init();
});
