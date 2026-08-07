// 全局变量
let vcardsData = [];
let filteredData = [];
let currentCategory = 'all';

// DOM 元素
const vcardGrid = document.getElementById('vcard-grid');
const searchInput = document.getElementById('search-input');
const filterTabs = document.querySelector('.filter-tabs');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const totalCountEl = document.getElementById('total-count');
const categoryCountEl = document.getElementById('category-count');

// 弹框相关元素
const modal = document.getElementById('download-modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalOrgName = document.getElementById('modal-org-name');
const modalPhones = document.getElementById('modal-phones');
const modalUrl = document.getElementById('modal-url');
const modalEmails = document.getElementById('modal-emails');
const confirmDownloadBtn = document.getElementById('confirm-download');
const cancelDownloadBtn = document.getElementById('cancel-download');
const closeBtn = document.querySelector('.close');

// 当前选中的 vCard 数据
let currentVCardData = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadVCardsData();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // 弹框相关事件
    confirmDownloadBtn.addEventListener('click', downloadVCard);
    cancelDownloadBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    
    // 点击弹框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 键盘事件
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// 加载 vCards 数据
async function loadVCardsData() {
    try {
        // 这里的数据将在构建时注入
        vcardsData = window.VCARDS_DATA || [];
        
        if (vcardsData.length === 0) {
            showEmptyState();
            return;
        }
        
        filteredData = [...vcardsData];
        
        // 更新统计信息
        updateStats();
        
        // 生成分类标签
        generateCategoryTabs();
        
        // 渲染卡片
        renderVCards();
        
        // 隐藏加载状态
        loading.style.display = 'none';
        
    } catch (error) {
        console.error('加载数据失败:', error);
        showEmptyState();
        loading.style.display = 'none';
    }
}

// 更新统计信息
function updateStats() {
    const categories = [...new Set(vcardsData.map(item => item.category))];
    totalCountEl.textContent = vcardsData.length;
    categoryCountEl.textContent = categories.length;
}

// 生成分类标签
function generateCategoryTabs() {
    const categories = [...new Set(vcardsData.map(item => item.category))].sort();
    
    categories.forEach(category => {
        const tab = document.createElement('button');
        tab.className = 'filter-tab';
        tab.dataset.category = category;
        tab.textContent = category;
        tab.addEventListener('click', () => handleCategoryFilter(category));
        filterTabs.appendChild(tab);
    });
}

// 处理分类过滤
function handleCategoryFilter(category) {
    currentCategory = category;
    
    // 更新标签状态
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = category === 'all' 
        ? document.querySelector('[data-category="all"]')
        : document.querySelector(`[data-category="${category}"]`);
    
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // 重新过滤数据
    filterData();
}

// 处理搜索
function handleSearch() {
    filterData();
}

// 过滤数据
function filterData() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    filteredData = vcardsData.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = !searchTerm || 
            item.organization.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            (item.phones && item.phones.some(phone => phoneNumber(phone).toLowerCase().includes(searchTerm) || phoneLabel(phone).toLowerCase().includes(searchTerm))) ||
            (item.url && item.url.toLowerCase().includes(searchTerm));
        
        return matchesCategory && matchesSearch;
    });
    
    renderVCards();
}

function phoneNumber(phone) {
    return String(typeof phone === 'object' && phone !== null ? phone.number : phone);
}

function phoneLabel(phone) {
    return typeof phone === 'object' && phone !== null && phone.label ? String(phone.label) : '';
}

function renderPhone(phone) {
    const label = phoneLabel(phone);
    return `<span class="phone-item">${phoneNumber(phone)}${label ? ` <small>${label}</small>` : ''}</span>`;
}

// 渲染 vCard 卡片
function renderVCards() {
    if (filteredData.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    vcardGrid.innerHTML = '';
    
    filteredData.forEach(vcard => {
        const cardElement = createVCardElement(vcard);
        vcardGrid.appendChild(cardElement);
    });
}

// 创建 vCard 元素
function createVCardElement(vcard) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'vcard-item';
    cardDiv.addEventListener('click', () => showDownloadModal(vcard));
    
    const iconUrl = `./icons/${vcard.category}/${vcard.filename}.png`;
    
    cardDiv.innerHTML = `
        <div class="vcard-header">
            <img src="${iconUrl}" alt="${vcard.organization}" class="vcard-icon" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMjQgMTJBNiA2IDAgMCAxIDMwIDE4QTYgNiAwIDAgMSAyNCAyNEE2IDYgMCAwIDEgMTggMThBNiA2IDAgMCAxIDI0IDEyWiIgZmlsbD0iIzY2NyIvPgo8cGF0aCBkPSJNMTIgMzZWMzRBNiA2IDAgMCAxIDE4IDI4SDMwQTYgNiAwIDAgMSAzNiAzNFYzNiIgZmlsbD0iIzY2NyIvPgo8L3N2Zz4K';">
            <div>
                <h3 class="vcard-title">${vcard.organization}</h3>
                <span class="vcard-category">${vcard.category}</span>
            </div>
        </div>
        <div class="vcard-info">
            ${vcard.phones && vcard.phones.length > 0 ? `
                <div class="vcard-phones">
                    ${vcard.phones.slice(0, 3).map(renderPhone).join('')}
                    ${vcard.phones.length > 3 ? `<span class="phone-item">+${vcard.phones.length - 3}</span>` : ''}
                </div>
            ` : ''}
            ${vcard.url ? `
                <a href="${vcard.url}" class="vcard-url" onclick="event.stopPropagation();" target="_blank" rel="noopener">
                    ${formatUrl(vcard.url)}
                </a>
            ` : ''}
        </div>
    `;
    
    return cardDiv;
}

// 格式化 URL 显示
function formatUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

// 显示下载弹框
function showDownloadModal(vcard) {
    currentVCardData = vcard;
    
    const iconUrl = `./icons/${vcard.category}/${vcard.filename}.png`;
    modalIcon.src = iconUrl;
    modalIcon.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNGOEY5RkEiLz4KPHBhdGggZD0iTTMyIDE2QTggOCAwIDAgMSA0MCAyNEE4IDggMCAwIDEgMzIgMzJBOCA4IDAgMCAxIDI0IDI0QTggOCAwIDAgMSAzMiAxNloiIGZpbGw9IiM2NjciLz4KPHBhdGggZD0iTTE2IDQ4VjQ0QTggOCAwIDAgMSAyNCAzNkg0MEE4IDggMCAwIDEgNDggNDRWNDgiIGZpbGw9IiM2NjciLz4KPC9zdmc+Cg==';
    };
    
    modalTitle.textContent = vcard.organization;
    modalOrgName.textContent = vcard.organization;
    
    // 显示电话号码
    if (vcard.phones && vcard.phones.length > 0) {
        modalPhones.innerHTML = `
            <strong>📞 电话号码：</strong>
            ${vcard.phones.map(renderPhone).join('')}
        `;
        modalPhones.style.display = 'block';
    } else {
        modalPhones.style.display = 'none';
    }
    
    // 显示网址
    if (vcard.url) {
        modalUrl.innerHTML = `
            <strong>🌐 官方网站：</strong>
            <a href="${vcard.url}" target="_blank" rel="noopener">${vcard.url}</a>
        `;
        modalUrl.style.display = 'block';
    } else {
        modalUrl.style.display = 'none';
    }
    
    // 显示邮箱
    if (vcard.emails && vcard.emails.length > 0) {
        modalEmails.innerHTML = `
            <strong>✉️ 邮箱地址：</strong>
            ${vcard.emails.map(email => `<a href="mailto:${email}">${email}</a>`).join(', ')}
        `;
        modalEmails.style.display = 'block';
    } else {
        modalEmails.style.display = 'none';
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 关闭弹框
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentVCardData = null;
}

// 下载 VCF 文件
function downloadVCard() {
    if (!currentVCardData) return;
    
    const vcfUrl = `./vcf/${currentVCardData.category}/${currentVCardData.filename}.vcf`;
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = vcfUrl;
    link.download = `${currentVCardData.organization}.vcf`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    closeModal();
}

// 显示空状态
function showEmptyState() {
    vcardGrid.style.display = 'none';
    emptyState.style.display = 'block';
}

// 隐藏空状态
function hideEmptyState() {
    vcardGrid.style.display = 'grid';
    emptyState.style.display = 'none';
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 当页面加载完成后，如果没有数据则显示占位信息
window.addEventListener('load', function() {
    if (!window.VCARDS_DATA || window.VCARDS_DATA.length === 0) {
        console.warn('vCards 数据未找到，请确保正确构建了项目');
    }
});
