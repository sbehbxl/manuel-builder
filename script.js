class ManualBuilder {
    constructor() {
        this.currentPage = 0;
        this.pages = [];
        this.manualData = {};
        
        this.initEventListeners();
        this.loadTheme();
    }
    
    initEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));
        
        // Form submission
        document.getElementById('manualForm').addEventListener('submit', this.generateManual.bind(this));
        
        // Add step button
        document.getElementById('addStepBtn').addEventListener('click', this.addStep.bind(this));
        
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.navigatePage(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.navigatePage(1));
        
        // Control buttons
        document.getElementById('backToFormBtn').addEventListener('click', this.backToForm.bind(this));
        document.getElementById('printBtn').addEventListener('click', () => window.print());
        document.getElementById('newManualBtn').addEventListener('click', this.backToForm.bind(this));
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('bookSection').style.display !== 'none') {
                if (e.key === 'ArrowLeft') this.navigatePage(-1);
                if (e.key === 'ArrowRight') this.navigatePage(1);
                if (e.key === 'Escape') this.backToForm();
            }
        });
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    addStep() {
        const stepsContainer = document.getElementById('stepsContainer');
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';
        stepDiv.innerHTML = `
            <input type="text" placeholder="Titre de l'étape" class="step-title">
            <textarea placeholder="Description détaillée de l'étape..." class="step-description" rows="3"></textarea>
            <button type="button" class="remove-step" onclick="removeStep(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        stepsContainer.appendChild(stepDiv);
    }
    
    generateManual(e) {
        e.preventDefault();
        
        // Collect form data
        this.manualData = {
            title: document.getElementById('manualTitle').value,
            category: document.getElementById('manualCategory').value,
            description: document.getElementById('manualDescription').value,
            coverColor: document.getElementById('coverColor').value,
            steps: this.collectSteps()
        };
        
        if (this.manualData.steps.length === 0) {
            alert('Veuillez ajouter au moins une étape au manuel.');
            return;
        }
        
        this.createPages();
        this.showBook();
    }
    
    collectSteps() {
        const stepItems = document.querySelectorAll('.step-item');
        const steps = [];
        
        stepItems.forEach((item, index) => {
            const title = item.querySelector('.step-title').value.trim();
            const description = item.querySelector('.step-description').value.trim();
            
            if (title && description) {
                steps.push({
                    number: index + 1,
                    title: title,
                    description: description
                });
            }
        });
        
        return steps;
    }
    
    createPages() {
        this.pages = [];
        
        // Cover page
        this.pages.push({
            type: 'cover',
            content: this.manualData
        });
        
        // Step pages
        this.manualData.steps.forEach(step => {
            this.pages.push({
                type: 'step',
                content: step
            });
        });
        
        this.renderPages();
    }
    
    renderPages() {
        const book = document.getElementById('book');
        const pagesContainer = document.getElementById('pagesContainer');
        
        // Clear existing pages except cover
        pagesContainer.innerHTML = '';
        
        // Update cover page
        this.updateCoverPage();
        
        // Create step pages
        this.pages.slice(1).forEach((pageData, index) => {
            const page = document.createElement('div');
            page.className = 'page content-page';
            page.innerHTML = this.getPageContent(pageData);
            pagesContainer.appendChild(page);
        });
        
        this.currentPage = 0;
        this.updatePageNavigation();
        this.updatePageCounter();
    }
    
    updateCoverPage() {
        document.getElementById('coverTitle').textContent = this.manualData.title;
        document.getElementById('coverCategory').textContent = this.getCategoryName(this.manualData.category);
        document.getElementById('coverDescription').textContent = this.manualData.description;
        document.getElementById('coverDate').textContent = new Date().toLocaleDateString('fr-FR');
        
        const coverPage = document.getElementById('coverPage');
        coverPage.style.background = `linear-gradient(135deg, ${this.manualData.coverColor}, #8b5cf6)`;
    }
    
    getCategoryName(category) {
        const categories = {
            'menuiserie': 'Menuiserie',
            'plomberie': 'Plomberie',
            'electricite': 'Électricité',
            'maconnerie': 'Maçonnerie',
            'decoration': 'Décoration',
            'jardinage': 'Jardinage',
            'renovation': 'Rénovation'
        };
        return categories[category] || category;
    }
    
    getPageContent(pageData) {
        if (pageData.type === 'step') {
            return `
                <div class="step-number">${pageData.content.number}</div>
                <h2 class="step-page-title">${pageData.content.title}</h2>
                <div class="step-page-content">${pageData.content.description.replace(/\n/g, '<br>')}</div>
            `;
        }
        return '';
    }
    
    showBook() {
        document.getElementById('creationSection').style.display = 'none';
        document.getElementById('bookSection').style.display = 'block';
        
        // Animate book appearance
        setTimeout(() => {
            document.querySelector('.book').style.opacity = '1';
            document.querySelector('.book').style.transform = 'scale(1)';
        }, 100);
    }
    
    backToForm() {
        document.getElementById('bookSection').style.display = 'none';
        document.getElementById('creationSection').style.display = 'block';
    }
    
    navigatePage(direction) {
        const newPage = this.currentPage + direction;
        
        if (newPage >= 0 && newPage < this.pages.length) {
            this.currentPage = newPage;
            this.updatePageNavigation();
            this.updatePageCounter();
        }
    }
    
    updatePageNavigation() {
        const allPages = document.querySelectorAll('.page');
        
        allPages.forEach((page, index) => {
            page.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentPage) {
                page.classList.add('active');
            } else if (index < this.currentPage) {
                page.classList.add('prev');
            } else {
                page.classList.add('next');
            }
        });
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = this.currentPage === 0;
        document.getElementById('nextBtn').disabled = this.currentPage === this.pages.length - 1;
    }
    
    updatePageCounter() {
        document.getElementById('currentPage').textContent = this.currentPage + 1;
        document.getElementById('totalPages').textContent = this.pages.length;
    }
}

// Global functions
function removeStep(button) {
    const stepItem = button.closest('.step-item');
    const stepsContainer = document.getElementById('stepsContainer');
    
    if (stepsContainer.children.length > 1) {
        stepItem.remove();
    } else {
        alert('Vous devez garder au moins une étape.');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ManualBuilder();
});