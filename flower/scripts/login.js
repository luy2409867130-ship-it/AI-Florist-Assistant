document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const rememberMe = document.getElementById('rememberMe');
    const loginBtn = document.getElementById('loginBtn');

    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');

    let isPasswordVisible = false;

    togglePassword.addEventListener('click', function() {
        isPasswordVisible = !isPasswordVisible;
        passwordInput.type = isPasswordVisible ? 'text' : 'password';
        
        const icon = this.querySelector('svg');
        if (isPasswordVisible) {
            icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>';
        } else {
            icon.innerHTML = '<path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7"/>';
        }
    });

    function validateUsername() {
        const value = usernameInput.value.trim();
        
        if (!value) {
            showError(usernameInput, usernameError, '请输入用户名或手机号');
            return false;
        }
        
        const phoneRegex = /^1[3-9]\d{9}$/;
        const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/;
        
        if (!phoneRegex.test(value) && !usernameRegex.test(value)) {
            showError(usernameInput, usernameError, '请输入有效的用户名或手机号');
            return false;
        }
        
        showSuccess(usernameInput, usernameError);
        return true;
    }

    function validatePassword() {
        const value = passwordInput.value;
        
        if (!value) {
            showError(passwordInput, passwordError, '请输入密码');
            return false;
        }
        
        if (value.length < 6) {
            showError(passwordInput, passwordError, '密码长度不能少于6位');
            return false;
        }
        
        if (value.length > 20) {
            showError(passwordInput, passwordError, '密码长度不能超过20位');
            return false;
        }
        
        showSuccess(passwordInput, passwordError);
        return true;
    }

    function showError(input, errorElement, message) {
        input.classList.remove('success');
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function showSuccess(input, errorElement) {
        input.classList.remove('error');
        input.classList.add('success');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    usernameInput.addEventListener('blur', validateUsername);
    usernameInput.addEventListener('input', function() {
        if (usernameInput.classList.contains('error')) {
            validateUsername();
        }
    });

    passwordInput.addEventListener('blur', validatePassword);
    passwordInput.addEventListener('input', function() {
        if (passwordInput.classList.contains('error')) {
            validatePassword();
        }
    });

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const isUsernameValid = validateUsername();
        const isPasswordValid = validatePassword();
        
        if (isUsernameValid && isPasswordValid) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="loading-text">登录中...</span>';
            
            simulateLogin();
        }
    });

    function simulateLogin() {
        setTimeout(function() {
            const username = usernameInput.value.trim();
            
            if (rememberMe.checked) {
                localStorage.setItem('ai-flower-username', username);
                localStorage.setItem('ai-flower-remember', 'true');
            } else {
                localStorage.removeItem('ai-flower-username');
                localStorage.removeItem('ai-flower-remember');
            }
            
            showNotification('登录成功！正在跳转...', 'success');
            
            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 1500);
        }, 1200);
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(function() {
            notification.classList.remove('show');
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 3000);
    }

    const forgotPassword = document.getElementById('forgotPassword');
    forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('忘记密码功能开发中...', 'info');
    });

    const registerLink = document.querySelector('.register-link');
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('注册功能开发中...', 'info');
    });

    const wechatLogin = document.getElementById('wechatLogin');
    wechatLogin.addEventListener('click', function() {
        showNotification('微信登录功能开发中...', 'info');
    });

    if (localStorage.getItem('ai-flower-remember') === 'true') {
        const savedUsername = localStorage.getItem('ai-flower-username');
        if (savedUsername) {
            usernameInput.value = savedUsername;
            rememberMe.checked = true;
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 30px;
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

        .loading-text {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .loading-text::after {
            content: '';
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
});