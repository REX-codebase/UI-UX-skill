// Avant-Garde UI-UX Explorer and Media App Logic

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  let activeTab = 'elements';
  let searchQuery = '';
  let elementsFilter = '';
  let fontsClassFilter = '';
  let fontsMoodFilter = '';
  
  let selectedFont = null;
  let selectedImage = null;
  let debounceTimeout = null;

  // --- UI ELEMENTS ---
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const mainNav = document.getElementById('mainNav');
  
  const elementsFilters = document.getElementById('elementsFilters');
  const fontsFilters = document.getElementById('fontsFilters');
  const categorySelect = document.getElementById('categorySelect');
  const classificationSelect = document.getElementById('classificationSelect');
  const moodSelect = document.getElementById('moodSelect');

  const loadingIndicator = document.getElementById('loadingIndicator');
  const emptyState = document.getElementById('emptyState');
  
  const elementsGrid = document.getElementById('elementsGrid');
  const fontsGrid = document.getElementById('fontsGrid');
  const imagesGrid = document.getElementById('imagesGrid');

  const fontPreviewCard = document.getElementById('fontPreviewCard');
  const mediaPreviewCard = document.getElementById('mediaPreviewCard');

  const previewTextInput = document.getElementById('previewTextInput');
  const fontStageText = document.getElementById('fontStageText');
  const previewFontName = document.getElementById('previewFontName');
  const previewFontUseCase = document.getElementById('previewFontUseCase');
  const fontCodeSnippet = document.getElementById('fontCodeSnippet');

  const mediaStageImg = document.getElementById('mediaStageImg');
  const mediaAuthorLink = document.getElementById('mediaAuthorLink');
  const mediaPhotoDesc = document.getElementById('mediaPhotoDesc');

  // --- RECTIVE ROUTING ---
  function init() {
    setupEventListeners();
    fetchData();
  }

  function setupEventListeners() {
    // Nav Tab routing
    mainNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-btn');
      if (!btn) return;

      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeTab = btn.dataset.tab;
      handleTabChange();
    });

    // Debounced Search Inputs
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        fetchData();
      }, 300);
    });

    // Clear Search Action
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      fetchData();
    });

    // Dropdown Filters
    categorySelect.addEventListener('change', (e) => {
      elementsFilter = e.target.value;
      fetchData();
    });

    classificationSelect.addEventListener('change', (e) => {
      fontsClassFilter = e.target.value;
      fetchData();
    });

    moodSelect.addEventListener('change', (e) => {
      fontsMoodFilter = e.target.value;
      fetchData();
    });

    // Live Font preview text area handler
    previewTextInput.addEventListener('input', (e) => {
      fontStageText.textContent = e.target.value || 'Typing preview...';
    });

    // Clipboard copy animations
    document.getElementById('copyFontSnippetBtn').addEventListener('click', (e) => {
      copyToClipboard(fontCodeSnippet.textContent, e.target, 'CSS Import Copied!');
    });

    document.getElementById('copyImageUrlBtn').addEventListener('click', (e) => {
      if (selectedImage) {
        copyToClipboard(selectedImage.url, e.target, 'URL Copied!');
      }
    });

    document.getElementById('copyImageMarkdownBtn').addEventListener('click', (e) => {
      if (selectedImage) {
        const md = `![${selectedImage.description}](${selectedImage.url})`;
        copyToClipboard(md, e.target, 'Markdown Copied!');
      }
    });

    // Theme Switcher Mood coordinate handler
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
      const currentMood = document.body.getAttribute('data-mood');
      const newMood = currentMood === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-mood', newMood);
    });
  }

  function handleTabChange() {
    // Reset filters and hide grid containers
    elementsGrid.classList.add('hidden');
    fontsGrid.classList.add('hidden');
    imagesGrid.classList.add('hidden');

    elementsFilters.classList.add('hidden');
    fontsFilters.classList.add('hidden');

    fontPreviewCard.classList.add('hidden');
    mediaPreviewCard.classList.add('hidden');

    // Switch Search placeholder text
    if (activeTab === 'elements') {
      elementsFilters.classList.remove('hidden');
      elementsGrid.classList.remove('hidden');
      searchInput.placeholder = 'Search 1000 Handcrafted Design Elements...';
    } else if (activeTab === 'fonts') {
      fontsFilters.classList.remove('hidden');
      fontsGrid.classList.remove('hidden');
      searchInput.placeholder = 'Search 1000 Underrated Google Fonts...';
      if (selectedFont) fontPreviewCard.classList.remove('hidden');
    } else if (activeTab === 'images') {
      imagesGrid.classList.remove('hidden');
      searchInput.placeholder = 'Search royalty-free photography images...';
      if (selectedImage) mediaPreviewCard.classList.remove('hidden');
    }

    fetchData();
  }

  // --- DATA FLOW CONTROLLER ---
  async function fetchData() {
    showLoading(true);
    emptyState.classList.add('hidden');

    // Resilient offline local file protocol fallback
    if (window.location.protocol === 'file:') {
      showLoading(false);
      let localMockData = [];
      if (activeTab === 'elements') {
        localMockData = [
          { ID: '101', Category: 'Layout', 'Design Element': 'Squircle Bento Grid 2.0', Description: 'Asymmetric layouts using variable card spans and responsive hover HSL border glow tokens.', 'Human Quality Signal': 'Emulates premium Linear and Apple interactive cells.' },
          { ID: '202', Category: 'Color', 'Design Element': 'OKLCH Polar Color Palette', Description: 'Luminance-correct polar color coordinates that maintain high perceptual contrast (APCA).', 'Human Quality Signal': 'APCA contrast compliant (Lc > 75).' },
          { ID: '303', Category: 'Animation', 'Design Element': 'Fluid Spring Physics', Description: 'Micro-interactions using spring-based momentum curves for delightful user feedback.', 'Human Quality Signal': 'Respects prefers-reduced-motion specifications.' }
        ];
      } else if (activeTab === 'fonts') {
        localMockData = [
          { 'Font Name': 'Instrument Serif', Classification: 'Serif', 'Mood/Personality': 'warm elegance', 'Use Case': 'Editorial headers and storytelling' },
          { 'Font Name': 'Space Grotesk', Classification: 'Sans Serif', 'Mood/Personality': 'technical precise', 'Use Case': 'Industrial dashboard metrics' }
        ];
      }
      renderData(localMockData);
      return;
    }

    let url = '';
    if (activeTab === 'elements') {
      url = `/api/elements?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(elementsFilter)}`;
    } else if (activeTab === 'fonts') {
      url = `/api/fonts?q=${encodeURIComponent(searchQuery)}&classification=${encodeURIComponent(fontsClassFilter)}&mood=${encodeURIComponent(fontsMoodFilter)}`;
    } else if (activeTab === 'images') {
      url = `/api/images?q=${encodeURIComponent(searchQuery)}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      showLoading(false);

      if (!data || data.length === 0) {
        showEmptyState(true);
        clearGrids();
        return;
      }

      renderData(data);
    } catch (err) {
      showLoading(false);
      showEmptyState(true);
      clearGrids();
      console.error('API Fetch failed:', err);
    }
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingIndicator.classList.remove('hidden');
      elementsGrid.style.opacity = '0.3';
      fontsGrid.style.opacity = '0.3';
      imagesGrid.style.opacity = '0.3';
    } else {
      loadingIndicator.classList.add('hidden');
      elementsGrid.style.opacity = '1';
      fontsGrid.style.opacity = '1';
      imagesGrid.style.opacity = '1';
    }
  }

  function showEmptyState(isEmpty) {
    if (isEmpty) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }
  }

  function clearGrids() {
    elementsGrid.innerHTML = '';
    fontsGrid.innerHTML = '';
    imagesGrid.innerHTML = '';
  }

  // --- HTML RENDERING ENGINE ---
  function renderData(data) {
    clearGrids();

    if (activeTab === 'elements') {
      data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'element-card';
        card.innerHTML = `
          <div class="el-header">
            <span class="el-id">ID #${item.ID}</span>
            <span class="el-cat">${item.Category}</span>
          </div>
          <h3>${item['Design Element']}</h3>
          <p>${item.Description}</p>
          <div class="el-signal">${item['Human Quality Signal']}</div>
        `;
        
        // Let user copy element text on card click
        card.addEventListener('click', () => {
          const text = `/* Element ID: ${item.ID} | Category: ${item.Category} */\n/* Design: ${item['Design Element']} */\n/* Pattern: ${item.Description} */\n/* Quality Signal: ${item['Human Quality Signal']} */`;
          navigator.clipboard.writeText(text);
          
          // Flash dynamic color overlay to acknowledge copy
          card.style.borderColor = 'var(--accent-success)';
          setTimeout(() => {
            card.style.borderColor = 'rgba(255,255,255,0.04)';
          }, 600);
        });

        elementsGrid.appendChild(card);
      });
    } else if (activeTab === 'fonts') {
      data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'font-card';
        if (selectedFont && selectedFont['Font Name'] === item['Font Name']) {
          card.classList.add('active');
        }

        // Apply fallback standard font dynamically, will load live font on preview focus
        card.innerHTML = `
          <div class="font-cls">${item.Classification}</div>
          <h3>${item['Font Name']}</h3>
          <div class="font-preview-sample" style="font-family: sans-serif;">Abc 123</div>
          <div class="font-mood">${item['Mood/Personality']}</div>
        `;

        card.addEventListener('click', () => {
          document.querySelectorAll('.font-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          selectFont(item);
        });

        fontsGrid.appendChild(card);
        
        // Default select first item
        if (index === 0 && !selectedFont) {
          card.classList.add('active');
          selectFont(item);
        }
      });
    } else if (activeTab === 'images') {
      data.forEach(item => {
        const itemNode = document.createElement('div');
        itemNode.className = 'image-item';
        itemNode.innerHTML = `
          <img src="${item.thumb}" alt="${item.description}" loading="lazy">
          <div class="img-overlay">
            <div class="img-desc">${item.description}</div>
            <div class="img-credit">By ${item.author}</div>
          </div>
        `;

        itemNode.addEventListener('click', () => {
          selectImage(item);
        });

        imagesGrid.appendChild(itemNode);
      });
      
      // Auto-preview first image if none selected
      if (data.length > 0 && !selectedImage) {
        selectImage(data[0]);
      }
    }
  }

  // --- LIVE TYPOGRAPHY AND IMAGE SELECT OPERATIONS ---
  function selectFont(font) {
    selectedFont = font;
    fontPreviewCard.classList.remove('hidden');

    const fontName = font['Font Name'];
    previewFontName.textContent = fontName;
    previewFontUseCase.textContent = `Ideal for: ${font['Use Case']} | Mood Profile: ${font['Mood/Personality']}`;

    // Generate dynamic @import URL code block snippet
    const importCode = `@import url('https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');\n\nbody {\n  font-family: '${fontName}', sans-serif;\n}`;
    fontCodeSnippet.textContent = importCode;

    // Dynamically inject stylesheet to document head to render font live!
    const linkId = `google-font-${fontName.replace(/ /g, '-').toLowerCase()}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap`;
      document.head.appendChild(link);
    }

    // Apply live styling
    fontStageText.style.fontFamily = `'${fontName}', serif`;
  }

  function selectImage(image) {
    selectedImage = image;
    mediaPreviewCard.classList.remove('hidden');

    mediaStageImg.src = image.url;
    mediaStageImg.alt = image.description;
    mediaPhotoDesc.textContent = image.description;
    mediaAuthorLink.textContent = image.author;
    mediaAuthorLink.href = image.author_url;
  }

  // Clipboard operations helper with responsive button flashing
  function copyToClipboard(text, button, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      const origText = button.textContent;
      button.textContent = successMsg;
      button.classList.add('copied');

      setTimeout(() => {
        button.textContent = origText;
        button.classList.remove('copied');
      }, 1500);
    });
  }

  init();
});
