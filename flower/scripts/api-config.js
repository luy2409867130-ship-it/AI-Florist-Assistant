const STORAGE_KEY = 'deepseek-api-key';

export function getApiKey() {
    return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiKey(apiKey) {
    localStorage.setItem(STORAGE_KEY, apiKey);
}

export function removeApiKey() {
    localStorage.removeItem(STORAGE_KEY);
}

export function hasApiKey() {
    const key = localStorage.getItem(STORAGE_KEY);
    return key && key.trim().length > 0;
}

export async function callDeepSeekApi(prompt, apiKey) {
    const url = 'https://api.deepseek.com/v1/chat/completions';
    
    const body = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
            {
                role: 'system',
                content: '你是一个专业的花店文案助手，擅长生成优美、吸引人的花卉相关文案。请用中文回复，语言要优美、简洁、有感染力。'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 1024
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