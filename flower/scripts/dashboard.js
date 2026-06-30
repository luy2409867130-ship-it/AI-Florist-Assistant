document.addEventListener('DOMContentLoaded', function() {
    const userNameElement = document.getElementById('userName');
    const welcomeTitle = document.getElementById('welcomeTitle');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const flowerRecommend = document.getElementById('flowerRecommend');
    const aiCopywriting = document.getElementById('aiCopywriting');
    const customerManagement = document.getElementById('customerManagement');
    const dataStatistics = document.getElementById('dataStatistics');
    
    const addCustomer = document.getElementById('addCustomer');
    const createOrder = document.getElementById('createOrder');
    const viewReports = document.getElementById('viewReports');
    const manageProducts = document.getElementById('manageProducts');

    function setWelcomeMessage() {
        const hour = new Date().getHours();
        let greeting;
        
        if (hour < 6) {
            greeting = '夜深了';
        } else if (hour < 12) {
            greeting = '早上好';
        } else if (hour < 14) {
            greeting = '中午好';
        } else if (hour < 18) {
            greeting = '下午好';
        } else {
            greeting = '晚上好';
        }
        
        welcomeTitle.textContent = `${greeting}！`;
    }

    function loadUserName() {
        const savedUsername = localStorage.getItem('ai-flower-username');
        if (savedUsername) {
            userNameElement.textContent = savedUsername;
        }
    }

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('ai-flower-username');
        localStorage.removeItem('ai-flower-remember');
        
        showNotification('已退出登录', 'success');
        
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1500);
    });

    flowerRecommend.addEventListener('click', function() {
        window.location.href = 'flower-recommend.html';
    });

    aiCopywriting.addEventListener('click', function() {
        window.location.href = 'ai-copywriting.html';
    });

    customerManagement.addEventListener('click', function() {
        showNotification('客户管理功能开发中...', 'info');
    });

    dataStatistics.addEventListener('click', function() {
        showNotification('数据统计功能开发中...', 'info');
    });

    addCustomer.addEventListener('click', function() {
        showNotification('新增客户功能开发中...', 'info');
    });

    createOrder.addEventListener('click', function() {
        showNotification('创建订单功能开发中...', 'info');
    });

    viewReports.addEventListener('click', function() {
        showNotification('查看报表功能开发中...', 'info');
    });

    manageProducts.addEventListener('click', function() {
        showNotification('商品管理功能开发中...', 'info');
    });

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: -300px;
            padding: 16px 24px;
            border-radius: 10px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            transition: right 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .notification-success {
            background: linear-gradient(135deg, #2ED573 0%, #7bed9f 100%);
        }

        .notification-info {
            background: linear-gradient(135deg, #3742fa 0%, #70a1ff 100%);
        }

        .notification-error {
            background: linear-gradient(135deg, #FF4757 0%, #ff6b81 100%);
        }

        .notification.show {
            right: 30px;
        }
    `;
    document.head.appendChild(style);

    setWelcomeMessage();
    loadUserName();
});