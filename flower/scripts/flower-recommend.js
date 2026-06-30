document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const userChoices = {
        recipient: '',
        budget: '',
        occasion: ''
    };

    const flowerDatabase = {
        girlfriend: {
            '100': {
                birthday: {
                    name: '浪漫玫瑰小花束',
                    price: '¥99',
                    reason: '精选9朵红玫瑰，搭配满天星点缀，浪漫又不失精致，适合生日送上一份温馨的祝福。'
                },
                confession: {
                    name: '心动告白玫瑰',
                    price: '¥99',
                    reason: '11朵红玫瑰代表一心一意的爱，是表白的经典选择，让她感受到你的真心。'
                },
                anniversary: {
                    name: '永恒之爱花束',
                    price: '¥99',
                    reason: '精选红玫瑰搭配尤加利叶，简约而不失优雅，纪念属于你们的美好时光。'
                }
            },
            '300': {
                birthday: {
                    name: '梦幻生日花礼',
                    price: '¥299',
                    reason: '33朵香槟玫瑰搭配粉色洋桔梗，梦幻般的色彩搭配，为她的生日增添浪漫氛围。'
                },
                confession: {
                    name: '挚爱一生花束',
                    price: '¥299',
                    reason: '52朵红玫瑰，代表"我爱你"的告白，搭配精美包装，让表白更加难忘。'
                },
                anniversary: {
                    name: '时光珍藏花束',
                    price: '¥299',
                    reason: '红玫瑰与白玫瑰交织，象征爱情的纯洁与热烈，纪念你们走过的美好时光。'
                }
            },
            '500': {
                birthday: {
                    name: '璀璨星夜花礼',
                    price: '¥499',
                    reason: '99朵顶级红玫瑰，搭配水晶草和满天星，如同璀璨星空般闪耀，给她最尊贵的生日惊喜。'
                },
                confession: {
                    name: '一生挚爱花束',
                    price: '¥499',
                    reason: '108朵红玫瑰，象征"嫁给我吧"的深情告白，是求婚表白的最佳选择。'
                },
                anniversary: {
                    name: '永恒承诺花束',
                    price: '¥499',
                    reason: '66朵玫瑰混搭，配上精致丝带和礼盒，见证你们永恒不变的爱情承诺。'
                }
            }
        },
        mom: {
            '100': {
                birthday: {
                    name: '温馨康乃馨花束',
                    price: '¥89',
                    reason: '19朵粉色康乃馨，代表对母亲的爱与感激，是生日祝福的温暖之选。'
                },
                confession: {
                    name: '感恩花语花束',
                    price: '¥89',
                    reason: '康乃馨搭配向日葵，表达对母亲深深的感激之情，感谢她的养育之恩。'
                },
                anniversary: {
                    name: '岁月静好花束',
                    price: '¥89',
                    reason: '淡雅的康乃馨花束，代表岁月静好，祝福母亲身体健康、幸福安康。'
                }
            },
            '300': {
                birthday: {
                    name: '母爱如歌花礼',
                    price: '¥268',
                    reason: '33朵康乃馨搭配百合，香气宜人，寓意母亲的爱如百合般纯洁高尚。'
                },
                confession: {
                    name: '春晖感恩花束',
                    price: '¥268',
                    reason: '向日葵与康乃馨的完美组合，象征母亲如阳光般温暖的爱，表达深深感恩。'
                },
                anniversary: {
                    name: '芳华依旧花束',
                    price: '¥268',
                    reason: '粉色玫瑰与康乃馨混搭，祝愿母亲永远年轻美丽，芳华依旧。'
                }
            },
            '500': {
                birthday: {
                    name: '福寿安康花礼',
                    price: '¥468',
                    reason: '99朵康乃馨搭配洋兰，豪华大气，祝福母亲福寿安康、幸福长寿。'
                },
                confession: {
                    name: '春晖永照花束',
                    price: '¥468',
                    reason: '精选多种鲜花搭配，表达对母亲最深沉的爱与敬意，春晖永照心间。'
                },
                anniversary: {
                    name: '幸福满堂花束',
                    price: '¥468',
                    reason: '大束混搭花礼，色彩丰富寓意吉祥，祝福母亲生活美满、幸福满堂。'
                }
            }
        },
        teacher: {
            '100': {
                birthday: {
                    name: '桃李芬芳花束',
                    price: '¥88',
                    reason: '向日葵搭配香槟玫瑰，象征老师如阳光般照亮学子前程，桃李满天下。'
                },
                confession: {
                    name: '师恩难忘花束',
                    price: '¥88',
                    reason: '白色康乃馨搭配勿忘我，表达对老师的尊敬与感激，师恩永记于心。'
                },
                anniversary: {
                    name: '春风化雨花束',
                    price: '¥88',
                    reason: '淡雅的花束搭配，寓意老师春风化雨般的教诲，润物细无声。'
                }
            },
            '300': {
                birthday: {
                    name: '德高望重花礼',
                    price: '¥258',
                    reason: '白玫瑰与百合的优雅组合，象征老师高尚的品德和纯洁的心灵。'
                },
                confession: {
                    name: '恩深似海花束',
                    price: '¥258',
                    reason: '精致的混搭花束，表达对老师"一日为师，终身为父"的深厚情谊。'
                },
                anniversary: {
                    name: '烛光礼赞花束',
                    price: '¥258',
                    reason: '温暖色调的花束搭配，致敬老师如蜡烛般燃烧自己照亮他人的奉献精神。'
                }
            },
            '500': {
                birthday: {
                    name: '桃李满门花礼',
                    price: '¥458',
                    reason: '大型高端花束，精选多种名贵花卉，祝福老师桃李满门、事业辉煌。'
                },
                confession: {
                    name: '师道尊崇花束',
                    price: '¥458',
                    reason: '尊贵的花材搭配，表达对老师崇高师德的敬仰与尊崇。'
                },
                anniversary: {
                    name: '杏坛春晖花束',
                    price: '¥458',
                    reason: '典雅大气的花束，致敬老师在教育园地辛勤耕耘，春晖遍洒。'
                }
            }
        }
    };

    const optionCards = document.querySelectorAll('.option-card');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const recommendBtn = document.getElementById('recommendBtn');
    const restartBtn = document.getElementById('restartBtn');
    const backBtn = document.getElementById('backBtn');
    const toCopywritingBtn = document.getElementById('toCopywritingBtn');
    const resultGrid = document.getElementById('resultGrid');

    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            const sectionId = this.closest('.question-section').id;
            const value = this.dataset.value;
            
            document.querySelectorAll(`#${sectionId} .option-card`).forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            if (sectionId === 'section1') {
                userChoices.recipient = value;
            } else if (sectionId === 'section2') {
                userChoices.budget = value;
            } else if (sectionId === 'section3') {
                userChoices.occasion = value;
            }
        });
    });

    function updateSteps() {
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    function showSection(sectionNumber) {
        document.querySelectorAll('.question-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`section${sectionNumber}`).style.display = 'block';
        
        if (sectionNumber === 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'flex';
            recommendBtn.style.display = 'none';
        } else if (sectionNumber === 3) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'none';
            recommendBtn.style.display = 'flex';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            recommendBtn.style.display = 'none';
        }
        
        updateSteps();
    }

    nextBtn.addEventListener('click', function() {
        if (currentStep === 1 && !userChoices.recipient) {
            alert('请先选择收礼对象');
            return;
        }
        if (currentStep === 2 && !userChoices.budget) {
            alert('请先选择预算范围');
            return;
        }
        currentStep++;
        showSection(currentStep);
    });

    prevBtn.addEventListener('click', function() {
        currentStep--;
        showSection(currentStep);
    });

    recommendBtn.addEventListener('click', function() {
        if (!userChoices.occasion) {
            alert('请先选择使用场景');
            return;
        }
        generateRecommendations();
    });

    function generateRecommendations() {
        const { recipient, budget, occasion } = userChoices;
        const recommendation = flowerDatabase[recipient][budget][occasion];
        
        document.querySelector('.action-section').style.display = 'none';
        document.querySelector('.step-indicator').style.display = 'none';
        document.querySelectorAll('.question-section').forEach(s => s.style.display = 'none');
        
        document.getElementById('resultSection').style.display = 'block';
        
        const flowerCard = `
            <div class="result-card">
                <div class="result-image">
                    <svg viewBox="0 0 100 100" class="flower-icon">
                        <circle cx="50" cy="50" r="8" fill="#FF6B8A"/>
                        <ellipse cx="50" cy="25" rx="12" ry="20" fill="#FFB6C1"/>
                        <ellipse cx="50" cy="75" rx="12" ry="20" fill="#FFB6C1"/>
                        <ellipse cx="25" cy="50" rx="20" ry="12" fill="#FFB6C1"/>
                        <ellipse cx="75" cy="50" rx="20" ry="12" fill="#FFB6C1"/>
                        <ellipse cx="30" cy="30" rx="15" ry="18" fill="#FFC0CB" transform="rotate(-45 30 30)"/>
                        <ellipse cx="70" cy="30" rx="15" ry="18" fill="#FFC0CB" transform="rotate(45 70 30)"/>
                        <ellipse cx="30" cy="70" rx="15" ry="18" fill="#FFC0CB" transform="rotate(45 30 70)"/>
                        <ellipse cx="70" cy="70" rx="15" ry="18" fill="#FFC0CB" transform="rotate(-45 70 70)"/>
                    </svg>
                </div>
                <div class="result-info">
                    <h3 class="result-name">${recommendation.name}</h3>
                    <div class="result-price">${recommendation.price}</div>
                    <p class="result-reason">${recommendation.reason}</p>
                </div>
            </div>
        `;
        
        resultGrid.innerHTML = flowerCard;
    }

    restartBtn.addEventListener('click', function() {
        userChoices.recipient = '';
        userChoices.budget = '';
        userChoices.occasion = '';
        currentStep = 1;
        
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.querySelector('.action-section').style.display = 'flex';
        document.querySelector('.step-indicator').style.display = 'flex';
        document.getElementById('resultSection').style.display = 'none';
        showSection(1);
    });

    backBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });

    toCopywritingBtn.addEventListener('click', function() {
        // 将推荐结果信息通过URL参数传递给AI文案页面
        const { recipient, budget, occasion } = userChoices;
        const recommendation = flowerDatabase[recipient]?.[budget]?.[occasion];
        const params = new URLSearchParams();
        if (recommendation) {
            params.append('flowerName', recommendation.name);
        }
        if (occasion) {
            params.append('occasion', occasion);
        }
        window.location.href = `ai-copywriting.html?${params.toString()}`;
    });

    showSection(1);
});