const STORAGE_KEY = 'deepseek-api-key';
// API密钥预留位置，请在下方的DEFAULT_API_KEY变量中填写您的DeepSeek API Key
// 格式示例: const DEFAULT_API_KEY = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const DEFAULT_API_KEY = 'sk-9858df47e8ac425397673aa1a3b0fbc4';

function getApiKey() {
    return localStorage.getItem(STORAGE_KEY) || '';
}

function setApiKey(apiKey) {
    localStorage.setItem(STORAGE_KEY, apiKey);
}

function removeApiKey() {
    localStorage.removeItem(STORAGE_KEY);
}

function hasApiKey() {
    const key = localStorage.getItem(STORAGE_KEY);
    return key && key.trim().length > 0 && key !== '${api_key}';
}

// ========== 提示词配置管理 ==========
let promptsConfig = null;

async function loadPromptsConfig() {
    if (promptsConfig) return promptsConfig;
    try {
        const response = await fetch('config/prompts-config.json');
        promptsConfig = await response.json();
        console.log('提示词配置已加载:', promptsConfig.version);
        return promptsConfig;
    } catch (error) {
        console.error('加载提示词配置失败，将使用默认配置:', error);
        return null;
    }
}

function resolveVariable(varName, rawValue, templateConfig) {
    const varConfig = templateConfig.variables[varName];
    if (!varConfig) return rawValue;
    if (varConfig.map && varConfig.map[rawValue]) {
        return varConfig.map[rawValue];
    }
    return rawValue;
}

function buildPromptFromTemplate(templateKey, formValues) {
    if (!promptsConfig || !promptsConfig.templates[templateKey]) {
        console.warn('模板不存在，回退到硬编码模式:', templateKey);
        return null;
    }

    const templateConfig = promptsConfig.templates[templateKey];
    let prompt = templateConfig.template;
    let keywordsSection = '';

    Object.keys(templateConfig.variables).forEach(varName => {
        const varConfig = templateConfig.variables[varName];
        const rawValue = formValues[varName] || '';

        if (varConfig.optional) {
            if (rawValue && rawValue.trim()) {
                let condText = varConfig.conditionalTemplate || '';
                condText = condText.replace(new RegExp(`{{${varName}}}`, 'g'), rawValue.trim());
                keywordsSection += condText;
            }
        } else {
            const resolvedValue = resolveVariable(varName, rawValue, templateConfig);
            prompt = prompt.replace(new RegExp(`{{${varName}}}`, 'g'), resolvedValue);
        }
    });

    prompt = prompt.replace('{{keywordsSection}}', keywordsSection);

    const tags = (templateConfig.tags || []).map(tag => {
        if (tag.startsWith('{{') && tag.endsWith('}}')) {
            const tagName = tag.slice(2, -2);
            if (tagName === 'styleShort' && templateConfig.styleShortMap) {
                return templateConfig.styleShortMap[formValues['style']] || formValues['style'];
            }
            return resolveVariable(tagName, formValues[tagName] || '', templateConfig);
        }
        return tag;
    });

    return { prompt, tags };
}

async function callDeepSeekApi(prompt, apiKey) {
    const url = 'https://api.deepseek.com/v1/chat/completions';

    const systemContent = (promptsConfig && promptsConfig.systemPrompt)
        ? promptsConfig.systemPrompt
        : '你是一位拥有15年经验的高级花艺营销顾问，同时也是资深文案策划。熟悉鲜花寓意、节日营销、礼品文化以及消费者心理，能够根据不同送礼对象、节日、预算和文案风格，生成具有真实情感、自然表达、适合商业使用的花店文案。';

    const temperature = (promptsConfig && promptsConfig.globalRules && promptsConfig.globalRules.temperature) || 0.7;
    const maxTokens = (promptsConfig && promptsConfig.globalRules && promptsConfig.globalRules.maxTokens) || 1024;

    const body = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
            {
                role: 'system',
                content: systemContent
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: temperature,
        max_tokens: maxTokens
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: body
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API请求失败，状态码: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('AI文案页面已加载');

    // 加载提示词配置文件
    await loadPromptsConfig();

    // 接收来自鲜花推荐页面的联动参数
    const urlParams = new URLSearchParams(window.location.search);
    const prefillFlowerName = urlParams.get('flowerName');
    const prefillOccasion = urlParams.get('occasion');

    if (prefillFlowerName) {
        const keywordsInput = document.getElementById('keywords');
        if (keywordsInput) {
            keywordsInput.value = prefillFlowerName;
        }
    }

    if (prefillOccasion) {
        const occasionRadio = document.querySelector(`input[name="occasion"][value="${prefillOccasion}"]`);
        if (occasionRadio) {
            occasionRadio.checked = true;
        }
    }

    const tabs = {
        marketing: document.getElementById('tabMarketing'),
        flower: document.getElementById('tabFlower'),
        greeting: document.getElementById('tabGreeting')
    };

    const sections = {
        marketing: document.getElementById('formMarketing'),
        flower: document.getElementById('formFlower'),
        greeting: document.getElementById('formGreeting')
    };

    const generateButtons = {
        marketing: document.getElementById('generateMarketing'),
        flower: document.getElementById('generateFlower'),
        greeting: document.getElementById('generateGreeting')
    };

    const resultSection = document.getElementById('resultSection');
    const resultCards = document.getElementById('resultCards');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const backBtn = document.getElementById('backBtn');
    
    const apiSettingsBtn = document.getElementById('apiSettingsBtn');
    const apiModal = document.getElementById('apiModal');
    const modalClose = document.getElementById('modalClose');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const toggleVisibility = document.getElementById('toggleVisibility');
    const apiStatusDisplay = document.getElementById('apiStatusDisplay');
    const apiStatus = document.getElementById('apiStatus');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const clearApiKeyBtn = document.getElementById('clearApiKey');

    let currentTab = 'marketing';
    let lastGeneratedData = null;
    let isApiKeyVisible = false;

    if (!hasApiKey() && DEFAULT_API_KEY !== '${api_key}') {
        setApiKey(DEFAULT_API_KEY);
        console.log('已设置默认API Key');
    }

    updateApiStatus();

    function updateApiStatus() {
        const hasKey = hasApiKey();
        if (hasKey) {
            apiStatus.textContent = 'API已配置';
            apiStatusDisplay.innerHTML = `
                <div class="status-icon success"></div>
                <span class="status-text">API Key已配置，可正常使用AI功能</span>
            `;
            apiKeyInput.value = '*******************';
        } else {
            apiStatus.textContent = '配置API';
            apiStatusDisplay.innerHTML = `
                <div class="status-icon pending"></div>
                <span class="status-text">未配置API Key，请先配置以使用AI功能</span>
            `;
            apiKeyInput.value = '';
        }
    }

    apiSettingsBtn.addEventListener('click', function() {
        console.log('API设置按钮被点击');
        apiModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    modalClose.addEventListener('click', function() {
        apiModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    apiModal.addEventListener('click', function(e) {
        if (e.target === apiModal) {
            apiModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    toggleVisibility.addEventListener('click', function() {
        isApiKeyVisible = !isApiKeyVisible;
        apiKeyInput.type = isApiKeyVisible ? 'text' : 'password';
        
        if (hasApiKey() && !isApiKeyVisible) {
            apiKeyInput.value = '*******************';
        } else if (hasApiKey() && isApiKeyVisible) {
            apiKeyInput.value = getApiKey();
        }
        
        toggleVisibility.innerHTML = isApiKeyVisible ? `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 12a5 5 0 0 1-10 0"/>
                <path d="M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0"/>
            </svg>
        ` : `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
        `;
    });

    saveApiKeyBtn.addEventListener('click', function() {
        const key = apiKeyInput.value.trim();
        
        if (!key) {
            showNotification('请输入API Key', 'error');
            return;
        }

        if (key.length < 20) {
            showNotification('请输入有效的API Key', 'error');
            return;
        }

        setApiKey(key);
        updateApiStatus();
        apiModal.style.display = 'none';
        document.body.style.overflow = '';
        showNotification('API Key已保存', 'success');
    });

    clearApiKeyBtn.addEventListener('click', function() {
        if (!hasApiKey()) {
            showNotification('没有可清除的API Key', 'info');
            return;
        }

        removeApiKey();
        apiKeyInput.value = '';
        updateApiStatus();
        showNotification('API Key已清除', 'info');
    });

    function switchTab(tabName) {
        console.log('切换到标签:', tabName);
        currentTab = tabName;
        
        Object.keys(tabs).forEach(key => {
            tabs[key].classList.remove('active');
            sections[key].style.display = 'none';
        });
        
        tabs[tabName].classList.add('active');
        sections[tabName].style.display = 'block';
        resultSection.style.display = 'none';
    }

    tabs.marketing.addEventListener('click', function() {
        switchTab('marketing');
    });
    
    tabs.flower.addEventListener('click', function() {
        switchTab('flower');
    });
    
    tabs.greeting.addEventListener('click', function() {
        switchTab('greeting');
    });

    generateButtons.marketing.addEventListener('click', async function() {
        console.log('营销文案生成按钮被点击');
        if (!hasApiKey()) {
            apiSettingsBtn.click();
            showNotification('请先配置API Key', 'info');
            return;
        }

        const flowerType = document.querySelector('input[name="flowerType"]:checked').value;
        const occasion = document.querySelector('input[name="occasion"]:checked').value;
        const style = document.querySelector('input[name="style"]:checked').value;
        const keywords = document.getElementById('keywords').value;

        lastGeneratedData = {
            type: 'marketing',
            flowerType,
            occasion,
            style,
            keywords
        };

        const formValues = { flowerType, occasion, style, keywords };
        const templateResult = buildPromptFromTemplate('marketing', formValues);

        if (templateResult) {
            await generateContent(templateResult.prompt, templateResult.tags);
        } else {
            // 后备：硬编码模式
            const styleDesc = {
                romantic: '浪漫温馨、情意绵绵',
                elegant: '优雅简约、品味高雅',
                poetic: '诗意文艺、富有意境',
                humorous: '活泼俏皮、轻松有趣'
            };
            let prompt = `请为${getFlowerTypeName(flowerType)}花束生成一段${styleDesc[style]}的营销文案，适用于${getOccasionName(occasion)}场合。`;
            if (keywords && keywords.trim()) {
                prompt += `请尽量包含以下关键词：${keywords}`;
            }
            prompt += '请生成3条不同风格的文案，每条文案单独一行。';
            await generateContent(prompt, ['营销文案', getFlowerTypeName(flowerType), getOccasionName(occasion), getStyleName(style)]);
        }
    });

    generateButtons.flower.addEventListener('click', async function() {
        console.log('花语描述生成按钮被点击');
        if (!hasApiKey()) {
            apiSettingsBtn.click();
            showNotification('请先配置API Key', 'info');
            return;
        }

        const flowerType = document.querySelector('input[name="flowerType2"]:checked').value;
        const color = document.querySelector('input[name="color"]:checked').value;

        lastGeneratedData = {
            type: 'flower',
            flowerType,
            color
        };

        const formValues = { flowerType, color };
        const templateResult = buildPromptFromTemplate('flower', formValues);

        if (templateResult) {
            await generateContent(templateResult.prompt, templateResult.tags);
        } else {
            // 后备：硬编码模式
            const prompt = `请为${getColorName(color)}${getFlowerTypeName(flowerType)}生成一段富有诗意的花语描述，介绍其象征意义和情感表达。请生成3条不同风格的花语描述，每条单独一行。`;
            await generateContent(prompt, ['花语描述', getFlowerTypeName(flowerType), getColorName(color)]);
        }
    });

    generateButtons.greeting.addEventListener('click', async function() {
        console.log('节日祝福生成按钮被点击');
        if (!hasApiKey()) {
            apiSettingsBtn.click();
            showNotification('请先配置API Key', 'info');
            return;
        }

        const holiday = document.querySelector('input[name="holiday"]:checked').value;
        const recipient = document.querySelector('input[name="recipient"]:checked').value;

        lastGeneratedData = {
            type: 'greeting',
            holiday,
            recipient
        };

        const formValues = { holiday, recipient };
        const templateResult = buildPromptFromTemplate('greeting', formValues);

        if (templateResult) {
            await generateContent(templateResult.prompt, templateResult.tags);
        } else {
            // 后备：硬编码模式
            const prompt = `请为${getHolidayName(holiday)}生成一段给${getRecipientName(recipient)}的温馨祝福文案。请生成3条不同风格的祝福，每条单独一行。`;
            await generateContent(prompt, ['节日祝福', getHolidayName(holiday), getRecipientName(recipient)]);
        }
    });

    async function generateContent(prompt, tags) {
        console.log('开始生成内容，prompt:', prompt);
        const activeButton = generateButtons[currentTab];
        activeButton.classList.add('loading');
        activeButton.querySelector('span').textContent = '生成中...';

        showLoadingState();

        try {
            const apiKey = getApiKey();
            console.log('使用API Key生成内容');
            const response = await callDeepSeekApi(prompt, apiKey);
            console.log('API响应:', response);

            // 解析API返回的文案，去除数字编号前缀
            const lines = response.split('\n').filter(t => t.trim());
            const texts = lines.map(line => {
                // 去除 "1."、"2."、"3." 等数字编号前缀
                return line.replace(/^\d+[\.\uff0e、\s]+/, '').trim();
            }).filter(t => t.length > 0);

            if (texts.length === 0) {
                throw new Error('API返回格式异常');
            }

            displayResults(texts, tags);

            // 记录生成的文案内容，供保存功能使用
            if (lastGeneratedData) {
                lastGeneratedData.texts = texts;
                lastGeneratedData.tags = tags;
            }
        } catch (error) {
            console.error('生成失败:', error);
            showNotification('生成失败，请检查API Key是否正确', 'error');
        } finally {
            hideLoadingState();
            activeButton.classList.remove('loading');
            activeButton.querySelector('span').textContent = getButtonText();
        }
    }

    function showLoadingState() {
        const existing = document.getElementById('loadingOverlay');
        if (existing) return;

        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-card">
                <div class="loading-animation">
                    <div class="loading-flower">
                        <div class="petal petal-1"></div>
                        <div class="petal petal-2"></div>
                        <div class="petal petal-3"></div>
                        <div class="petal petal-4"></div>
                        <div class="loading-center"></div>
                    </div>
                </div>
                <h3 class="loading-title">您的要求已收到</h3>
                <p class="loading-desc">AI正在为您精心撰写文案，请稍候...</p>
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function hideLoadingState() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    function getButtonText() {
        const texts = {
            marketing: '生成文案',
            flower: '生成花语',
            greeting: '生成祝福'
        };
        return texts[currentTab];
    }

    function displayResults(texts, tags) {
        resultCards.innerHTML = texts.map((text, index) => `
            <div class="result-card">
                <p class="result-text">${text.trim()}</p>
                <div class="result-tags">
                    ${tags.map(tag => `<span class="result-tag">${tag}</span>`).join('')}
                    <span class="result-tag copy-tag" data-text="${encodeURIComponent(text.trim())}">点击复制</span>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.copy-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const text = decodeURIComponent(this.dataset.text);
                navigator.clipboard.writeText(text).then(() => {
                    this.textContent = '已复制';
                    setTimeout(() => {
                        this.textContent = '点击复制';
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败:', err);
                    showNotification('复制失败', 'error');
                });
            });
        });

        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getFlowerTypeName(type) {
        const names = {
            rose: '玫瑰',
            carnation: '康乃馨',
            lily: '百合',
            sunflower: '向日葵',
            mixed: '混搭'
        };
        return names[type] || type;
    }

    function getOccasionName(occasion) {
        const names = {
            birthday: '生日',
            confession: '表白',
            anniversary: '纪念日',
            thanksgiving: '感恩'
        };
        return names[occasion] || occasion;
    }

    function getStyleName(style) {
        const names = {
            romantic: '浪漫温馨',
            elegant: '优雅简约',
            poetic: '诗意文艺',
            humorous: '活泼俏皮'
        };
        return names[style] || style;
    }

    function getColorName(color) {
        const names = {
            red: '红色',
            pink: '粉色',
            white: '白色',
            mixed: '多彩'
        };
        return names[color] || color;
    }

    function getHolidayName(holiday) {
        const names = {
            valentines: '情人节',
            mothers: '母亲节',
            teachers: '教师节',
            christmas: '圣诞节'
        };
        return names[holiday] || holiday;
    }

    function getRecipientName(recipient) {
        const names = {
            lover: '爱人',
            mother: '母亲',
            teacher: '老师',
            friend: '朋友'
        };
        return names[recipient] || recipient;
    }

    regenerateBtn.addEventListener('click', function() {
        resultSection.style.display = 'none';
    });

    saveBtn.addEventListener('click', function() {
        if (!lastGeneratedData || !lastGeneratedData.texts) return;

        const savedCopies = JSON.parse(localStorage.getItem('ai-flower-copies') || '[]');
        const record = {
            texts: lastGeneratedData.texts,
            tags: lastGeneratedData.tags,
            type: lastGeneratedData.type,
            scenario: buildScenarioText(lastGeneratedData),
            timestamp: new Date().toISOString()
        };
        savedCopies.unshift(record);
        // 只保留最近5条
        const trimmed = savedCopies.slice(0, 5);
        localStorage.setItem('ai-flower-copies', JSON.stringify(trimmed));

        showNotification('文案已保存', 'success');
        renderHistory();
    });

    function buildScenarioText(data) {
        const typeNames = { marketing: '营销文案', flower: '花语描述', greeting: '节日祝福' };
        let parts = [typeNames[data.type] || '文案'];
        if (data.flowerType) parts.push(getFlowerTypeName(data.flowerType));
        if (data.occasion) parts.push(getOccasionName(data.occasion));
        if (data.style) parts.push(getStyleName(data.style));
        if (data.color) parts.push(getColorName(data.color));
        if (data.holiday) parts.push(getHolidayName(data.holiday));
        if (data.recipient) parts.push(getRecipientName(data.recipient));
        return parts.join(' · ');
    }

    function formatTime(iso) {
        const d = new Date(iso);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        const savedCopies = JSON.parse(localStorage.getItem('ai-flower-copies') || '[]');

        if (savedCopies.length === 0) {
            historyList.innerHTML = '<p class="history-empty">暂无保存记录，生成文案后点击「保存文案」即可记录</p>';
            return;
        }

        historyList.innerHTML = savedCopies.map((record, index) => `
            <div class="history-card">
                <div class="history-header">
                    <div class="history-meta">
                        <span class="history-num">#${index + 1}</span>
                        <span class="history-scenario">${record.scenario}</span>
                    </div>
                    <span class="history-time">${formatTime(record.timestamp)}</span>
                </div>
                <div class="history-body">
                    ${record.texts.map(t => `<p class="history-text">${t}</p>`).join('')}
                </div>
                <div class="history-tags">
                    ${(record.tags || []).map(tag => `<span class="history-tag">${tag}</span>`).join('')}
                </div>
                <div class="history-actions">
                    <button class="history-btn copy-all" data-texts='${encodeURIComponent(JSON.stringify(record.texts))}'>复制全部</button>
                    <button class="history-btn delete-one" data-index="${index}">删除</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.copy-all').forEach(btn => {
            btn.addEventListener('click', function() {
                const texts = JSON.parse(decodeURIComponent(this.dataset.texts));
                navigator.clipboard.writeText(texts.join('\n')).then(() => {
                    showNotification('已复制全部文案', 'success');
                }).catch(() => {
                    showNotification('复制失败', 'error');
                });
            });
        });

        document.querySelectorAll('.delete-one').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                const copies = JSON.parse(localStorage.getItem('ai-flower-copies') || '[]');
                copies.splice(idx, 1);
                localStorage.setItem('ai-flower-copies', JSON.stringify(copies));
                renderHistory();
                showNotification('已删除该记录', 'info');
            });
        });
    }

    renderHistory();

    backBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
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

        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(250, 250, 252, 0.85);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .loading-card {
            background: #FFFFFF;
            border-radius: 20px;
            padding: 48px 56px;
            text-align: center;
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
            border: 1px solid #F0F0F0;
        }

        .loading-animation {
            margin-bottom: 24px;
        }

        .loading-flower {
            position: relative;
            width: 64px;
            height: 64px;
            margin: 0 auto;
            animation: spin 3s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .petal {
            position: absolute;
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #FF6B8A, #FF8FAB);
            border-radius: 50% 50% 50% 0;
            opacity: 0.8;
        }

        .petal-1 { top: 0; left: 18px; transform: rotate(0deg); }
        .petal-2 { top: 18px; right: 0; transform: rotate(90deg); }
        .petal-3 { bottom: 0; left: 18px; transform: rotate(180deg); }
        .petal-4 { top: 18px; left: 0; transform: rotate(270deg); }

        .loading-center {
            position: absolute;
            top: 22px;
            left: 22px;
            width: 20px;
            height: 20px;
            background: #FFD700;
            border-radius: 50%;
            box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
        }

        .loading-title {
            font-size: 20px;
            font-weight: 700;
            color: #2D2D2D;
            margin: 0 0 8px;
        }

        .loading-desc {
            font-size: 14px;
            color: #999;
            margin: 0 0 20px;
        }

        .loading-dots {
            display: flex;
            justify-content: center;
            gap: 6px;
        }

        .loading-dots span {
            width: 8px;
            height: 8px;
            background: #FF6B8A;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    console.log('所有事件绑定完成');
});