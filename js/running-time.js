document.addEventListener('DOMContentLoaded', () => {
    const runtimeController = {
        startDate: new Date('2024-08-10T00:00:00'),
        runtimeElement: document.getElementById('runningdays'),
        updateInterval: 60000, // 1分钟更新一次

        formatTime(timeDifference) {
            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            
            return `${days}天${hours}小时${minutes}分钟`;
        },

        updateRuntime() {
            if (!this.runtimeElement) return;
            
            const now = new Date();
            const timeDifference = now.getTime() - this.startDate.getTime();
            this.runtimeElement.textContent = this.formatTime(timeDifference);
        },

        init() {
            if (!this.runtimeElement) return;

            // 初始更新
            this.updateRuntime();
            
            // 设置定时更新
            setInterval(() => this.updateRuntime(), this.updateInterval);
        }
    };

    runtimeController.init();
});