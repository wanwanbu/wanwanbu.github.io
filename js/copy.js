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
                button.textContent = '已复制!';
                setTimeout(() => button.textContent = '复制', 2000);
            } catch (err) {
                console.error('复制失败:', err);
                button.textContent = '复制失败';
                setTimeout(() => button.textContent = '复制', 2000);
            }
        },

        toggleFold(block, button) {
            block.classList.toggle('folded');
            button.textContent = block.classList.contains('folded') ? '展开' : '折叠';
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
