/* =======================================================
   static/js/main.js
   ======================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. БАЗА ДАННЫХ И ИНИЦИАЛИЗАЦИЯ (JSON)
    // ==========================================
    let mangaData = [];

    // ОПРЕДЕЛЯЕМ ТИП СТРАНИЦЫ (manga, manhwa или novel)
    const getPageType = () => {
        const title = document.title.toLowerCase();
        if (title.includes('manhwa')) return 'manhwa';
        if (title.includes('novel') || title.includes('renobe')) return 'novel';
        return 'manga'; // по умолчанию манга
    };

    async function loadMangaData() {
        try {
            const response = await fetch('static/data/manga.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            mangaData = await response.json();
            
            if (document.getElementById('mangaGrid')) {
                renderManga();
            }
        } catch (error) {
            console.error("Xatolik! Manga ma'lumotlarini yuklab bo'lmadi:", error);
            const grid = document.getElementById('mangaGrid');
            if (grid) {
                grid.innerHTML = `<div class="col-span-full text-center text-red-500 py-10 font-bold uppercase tracking-widest text-xs">Ma'lumotlarni yuklashda xatolik yuz berdi</div>`;
            }
        }
    }

    // ==========================================
    // 2. УТИЛИТЫ
    // ==========================================
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // ==========================================
    // 3. ГЛОБАЛЬНЫЙ UI
    // ==========================================

    const orb1 = document.getElementById('orb1');
    const orb2 = document.getElementById('orb2');
    if (orb1 && orb2) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            orb1.style.transform = `translate(${x * 50}px, ${y * 50}px)`;
            orb2.style.transform = `translate(${x * -30}px, ${y * -30}px)`;
        });
    }

    const mobileBottomMenuBtn = document.getElementById('mobileBottomMenuBtn');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    function toggleMobileMenu(show) {
        if (!mobileMenu) return;
        if (show) {
            mobileMenu.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden'; 
        } else {
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = '';
        }
    }

    if(mobileBottomMenuBtn) mobileBottomMenuBtn.addEventListener('click', () => toggleMobileMenu(true));
    if(closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', () => toggleMobileMenu(false));

    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchPanel = document.getElementById('searchPanel');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    function openSearch(e) {
        if (!searchOverlay) return;
        e.stopPropagation();
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput.focus(), 100);
    }

    function closeSearchPanel() {
        if (!searchOverlay) return;
        searchOverlay.classList.remove('active');
        if(searchInput) searchInput.value = '';
        if(searchResults) {
            searchResults.classList.add('hidden');
            searchResults.classList.remove('flex');
            searchResults.innerHTML = '';
        }
        if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
    }

    if(searchToggle) searchToggle.addEventListener('click', openSearch);

    window.addEventListener('click', (e) => {
        if (searchOverlay && searchOverlay.classList.contains('active') && searchPanel && !searchPanel.contains(e.target)) {
            closeSearchPanel();
        }
    });

    document.addEventListener('keydown', (e) => {
        if(e.key === "Escape") {
            closeSearchPanel();
            if (typeof window.toggleDrawer === 'function') window.toggleDrawer(false); 
            toggleMobileMenu(false);
        }
    });

    const handleSearch = debounce((query) => {
        if (!searchResults) return;
        
        if (query === '') {
            searchResults.classList.add('hidden');
            searchResults.classList.remove('flex');
            searchResults.innerHTML = '';
            if(clearSearchBtn) clearSearchBtn.classList.add('hidden');
            return;
        }

        if(clearSearchBtn) clearSearchBtn.classList.remove('hidden');

        const filtered = mangaData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.author.toLowerCase().includes(query)
        );

        searchResults.classList.remove('hidden');
        searchResults.classList.add('flex');

        if (filtered.length > 0) {
            searchResults.innerHTML = filtered.map(manga => {
                let profileUrl = manga.url ? manga.url : (manga.title === "Arra odam" ? "manga_profile_base.html" : "manga_profile.html");
                
                return `
                <a href="${profileUrl}" class="search-result-item block w-full">
                    <img src="${manga.img}" alt="${manga.title}" class="search-result-img" onerror="this.src='https://via.placeholder.com/45x60/16151a/8a60c2?text=?'">
                    <div>
                        <div class="text-[13px] font-black text-white uppercase tracking-tight">${manga.title}</div>
                        <div class="text-[10px] font-bold text-[#8a60c2] mt-1 tracking-widest uppercase">${manga.author} • ${manga.year}</div>
                    </div>
                </a>
            `}).join('');
        } else {
            searchResults.innerHTML = `<div class="p-6 text-center text-xs text-gray-500 font-bold uppercase tracking-widest">Hech narsa topilmadi</div>`;
        }
    }, 300);

    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value.trim().toLowerCase());
        });
    }

    if(clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            handleSearch('');
            searchInput.focus();
        });
    }

    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
            }
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ==========================================
    // 4. ЛОГИКА СТРАНИЦЫ КАТАЛОГА
    // ==========================================
    const mangaGrid = document.getElementById('mangaGrid');
    
    function initMobileScrollFocus() {
        if (window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
            const options = { root: null, rootMargin: '-30% 0px -30% 0px', threshold: 0.1 };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const card = entry.target.querySelector('.manga-card');
                    if(card) {
                        if (entry.isIntersecting) card.classList.add('scroll-focus');
                        else card.classList.remove('scroll-focus');
                    }
                });
            }, options);

            document.querySelectorAll('.manga-item').forEach(item => observer.observe(item));
        }
    }

    // --- ФУНКЦИЯ ОТРИСОВКИ С ФИЛЬТРАЦИЕЙ ПО ТИПУ ---
    function renderManga(genreFilter = 'all') {
        if (!mangaGrid) return;
        mangaGrid.innerHTML = '';
        
        const typeFilter = getPageType(); // Определяем: manga или manhwa

        // Фильтруем сначала по типу страницы, потом по жанру
        const filtered = mangaData.filter(item => {
            const matchesType = item.type === typeFilter;
            const matchesGenre = (genreFilter === 'all' || item.genre === genreFilter);
            return matchesType && matchesGenre;
        });

        if(filtered.length === 0) {
            mangaGrid.innerHTML = `<div class="col-span-full text-center text-gray-500 py-20 font-bold uppercase tracking-widest text-xs opacity-50">Hech narsa topilmadi</div>`;
            return;
        }

        filtered.forEach((manga, index) => {
            const ratioClass = manga.ratio ? manga.ratio : 'ratio-1'; 
            let profileUrl = manga.url ? manga.url : (manga.title === "Arra odam" ? "manga_profile_base.html" : "manga_profile.html");
            
            const html = `
                <a href="${profileUrl}" class="manga-item" style="animation-delay: ${(index % 8) * 0.05}s">
                    <div class="manga-card ${ratioClass}">
                        <img src="${manga.img}" alt="${manga.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x600/16151a/8a60c2?text=Manga'">
                        <div class="details-overlay">
                            <div class="manga-author text-[9px] font-bold uppercase tracking-widest text-[#8a60c2] mb-1">${manga.author}</div>
                            <h3 class="manga-title text-xs md:text-sm font-black uppercase leading-tight">${manga.title}</h3>
                            <div class="mt-2 border-t border-white/10 pt-2 flex justify-between items-center">
                                <span class="text-[8px] opacity-50 uppercase">${manga.year}</span>
                                <i class="fas fa-plus text-[10px]"></i>
                            </div>
                        </div>
                    </div>
                </a>
            `;
            mangaGrid.insertAdjacentHTML('beforeend', html);
        });
        
        setTimeout(initMobileScrollFocus, 50);
    }

    if (mangaGrid) {
        document.querySelectorAll('#genreFilters .filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('#genreFilters .filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                renderManga(chip.dataset.genre);
            });
        });

        const mobileInlineSearch = document.getElementById('mobileInlineSearch');
        if (mobileInlineSearch) {
            mobileInlineSearch.addEventListener('input', (e) => {
                const query = e.target.value.trim().toLowerCase();
                const items = document.querySelectorAll('.manga-item');
                items.forEach(item => {
                    const title = item.querySelector('.manga-title').textContent.toLowerCase();
                    const author = item.querySelector('.manga-author').textContent.toLowerCase();
                    item.style.display = (title.includes(query) || author.includes(query)) ? 'block' : 'none';
                });
            });
        }

        const openDrawer = document.getElementById('openDrawer');
        const openDrawerMobile = document.getElementById('openDrawerMobile'); 
        const closeDrawer = document.getElementById('closeDrawer');
        const sideDrawer = document.getElementById('sideDrawer');
        const drawerOverlay = document.getElementById('drawerOverlay');

        window.toggleDrawer = function(isOpen) {
            if (!sideDrawer || !drawerOverlay) return;
            if (isOpen) {
                sideDrawer.classList.remove('opacity-0', '-translate-y-8', 'scale-95', 'pointer-events-none');
                sideDrawer.classList.add('opacity-100', 'translate-y-0', 'scale-100', 'pointer-events-auto');
                drawerOverlay.classList.remove('opacity-0', 'pointer-events-none');
                document.body.style.overflow = 'hidden'; 
            } else {
                sideDrawer.classList.add('opacity-0', '-translate-y-8', 'scale-95', 'pointer-events-none');
                sideDrawer.classList.remove('opacity-100', 'translate-y-0', 'scale-100', 'pointer-events-auto');
                drawerOverlay.classList.add('opacity-0', 'pointer-events-none');
                document.body.style.overflow = ''; 
            }
        }

        if(openDrawer) openDrawer.addEventListener('click', () => window.toggleDrawer(true));
        if(openDrawerMobile) openDrawerMobile.addEventListener('click', () => window.toggleDrawer(true));
        if(closeDrawer) closeDrawer.addEventListener('click', () => window.toggleDrawer(false));
        if(drawerOverlay) drawerOverlay.addEventListener('click', () => window.toggleDrawer(false));
    }

    loadMangaData();

    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.className = "tab-btn pb-3 text-[13px] md:text-sm font-bold text-gray-500 hover:text-white transition border-b-2 border-transparent hover:border-gray-700";
        });
        
        const activeBtn = document.getElementById(`btn-tab-${tabName}`);
        if(activeBtn) {
            activeBtn.className = "tab-btn pb-3 text-[13px] md:text-sm font-bold text-white border-b-2 border-[#8a60c2] transition";
        }

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        const activeContent = document.getElementById(`tab-${tabName}`);
        if(activeContent) {
            activeContent.classList.remove('hidden');
            activeContent.style.opacity = '0';
            setTimeout(() => activeContent.style.opacity = '1', 50);
        }
    }

});