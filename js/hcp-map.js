// HCP Map functionality
class HCPMap {
  constructor() {
    this.map = null;
    this.markers = [];
    this.currentCountry = null;
    this.init();
  }

  init() {
    this.initializeMap();
    this.addCountryMarkers();
    this.setupEventListeners();
  }

  initializeMap() {
    // Load SVG map
    this.loadSVGMap();
  }

  loadSVGMap() {
    const mapContainer = document.getElementById('hcpMap');
    
    // Create SVG container
    const svgContainer = document.createElement('div');
    svgContainer.className = 'svg-map-container';
    svgContainer.innerHTML = `
      <div class="map-controls">
        <button id="zoomIn" class="map-btn" title="Zoom In">+</button>
        <button id="zoomOut" class="map-btn" title="Zoom Out">-</button>
        <button id="resetView" class="map-btn" title="Reset View">⌂</button>
      </div>
    `;
    
    // Load SVG
    fetch('assets/world-map.svg')
      .then(response => response.text())
      .then(svgText => {
        svgContainer.innerHTML += svgText;
        mapContainer.appendChild(svgContainer);
        
        // Initialize SVG interactions
        this.initializeSVGInteractions();
        this.initializeZoom();
      })
      .catch(error => {
        console.error('Error loading SVG map:', error);
        mapContainer.innerHTML = '<p>Error loading map</p>';
      });
  }

  initializeSVGInteractions() {
    // Color intensity function
    const getColorIntensity = (count) => {
      if (count === 0) return '#e5e7eb'; // Light gray (koyulaştırıldı)
      if (count <= 2) return '#bbf7d0'; // Light green (koyulaştırıldı)
      if (count <= 5) return '#86efac'; // Medium light green (koyulaştırıldı)
      if (count <= 10) return '#4ade80'; // Medium green (koyulaştırıldı)
      if (count <= 20) return '#22c55e'; // Dark green (koyulaştırıldı)
      if (count <= 50) return '#16a34a'; // Very dark green (yeni kategori)
      if (count <= 100) return '#15803d'; // Extra dark green (yeni kategori)
      return '#14532d'; // Darkest green (100+ için yeni kategori)
    };

    // Color countries based on HCP data
    this.colorCountries(getColorIntensity);
    
    // Add event listeners
    this.addSVGEventListeners();
    
    // Add legend
    this.addLegend();
  }

  colorCountries(getColorIntensity) {
    const countries = getAllCountries();
    
    countries.forEach(country => {
      const hcpCount = getCountryData(country).length;
      const color = getColorIntensity(hcpCount);
      
      // Find country elements in SVG by both class and id
      let countryElements = document.querySelectorAll(`.${country}`);
      
      // Special case for United Kingdom (has space in class name)
      if (country === 'United Kingdom') {
        countryElements = document.querySelectorAll('path[class="United Kingdom"]');
      }
      
      // Special case for United States (has space in class name)
      if (country === 'United States') {
        countryElements = document.querySelectorAll('path[class="United States"]');
      }
      
      // Special case for New Zealand (has space in class name)
      if (country === 'New Zealand') {
        countryElements = document.querySelectorAll('path[class="New Zealand"]');
      }
      
      // If no elements found by class, try by id (country code mapping)
      if (countryElements.length === 0) {
        const countryCodeMap = {
          'Austria': 'AT',
          'Brazil': 'BR', 
          'Germany': 'DE',
          'Spain': 'ES',
          'Italy': 'IT',
          'Netherlands': 'NL',
          'Poland': 'PL',
          'Portugal': 'PT',
          'Slovenia': 'SI',
          'Sweden': 'SE',
          'Switzerland': 'CH',
          'Czech Republic': 'CZ',
          'Colombia': 'CO',
          'Israel': 'IL',
          'Argentina': 'AR',
          'Australia': 'AU',
          'Canada': 'CA',
          'Chile': 'CL',
          'Denmark': 'DK',
          'Greece': 'GR',
          'Japan': 'JP',
          'New Zealand': 'NZ',
          'Norway': 'NO',
          'Saudi Arabia': 'SA',
          'South Korea': 'KR',
          'Turkey': 'TR',
          'United Arab Emirates': 'AE',
          'United States': 'US'
        };
        
        const countryCode = countryCodeMap[country];
        if (countryCode) {
          countryElements = document.querySelectorAll(`#${countryCode}`);
        }
      }
      
      countryElements.forEach(element => {
        element.style.fill = color;
        element.style.stroke = '#ffffff';
        element.style.strokeWidth = '1';
        element.style.cursor = 'pointer';
        
        // Store country data
        element.country = country;
        element.hcpCount = hcpCount;
      });
    });
  }

  addSVGEventListeners() {
    const countries = getAllCountries();
    
    countries.forEach(country => {
      // Find country elements by both class and id
      let countryElements = document.querySelectorAll(`.${country}`);
      
      // Special case for United Kingdom (has space in class name)
      if (country === 'United Kingdom') {
        countryElements = document.querySelectorAll('path[class="United Kingdom"]');
      }
      
      // Special case for United States (has space in class name)
      if (country === 'United States') {
        countryElements = document.querySelectorAll('path[class="United States"]');
      }
      
      // Special case for New Zealand (has space in class name)
      if (country === 'New Zealand') {
        countryElements = document.querySelectorAll('path[class="New Zealand"]');
      }
      
      // If no elements found by class, try by id (country code mapping)
      if (countryElements.length === 0) {
        const countryCodeMap = {
          'Austria': 'AT',
          'Brazil': 'BR', 
          'Germany': 'DE',
          'Spain': 'ES',
          'Italy': 'IT',
          'Netherlands': 'NL',
          'Poland': 'PL',
          'Portugal': 'PT',
          'Slovenia': 'SI',
          'Sweden': 'SE',
          'Switzerland': 'CH',
          'Czech Republic': 'CZ',
          'Colombia': 'CO',
          'Israel': 'IL',
          'Argentina': 'AR',
          'Australia': 'AU',
          'Canada': 'CA',
          'Chile': 'CL',
          'Denmark': 'DK',
          'Greece': 'GR',
          'Japan': 'JP',
          'New Zealand': 'NZ',
          'Norway': 'NO',
          'Saudi Arabia': 'SA',
          'South Korea': 'KR',
          'Turkey': 'TR',
          'United Arab Emirates': 'AE',
          'United States': 'US'
        };
        
        const countryCode = countryCodeMap[country];
        if (countryCode) {
          countryElements = document.querySelectorAll(`#${countryCode}`);
        }
      }
      
      countryElements.forEach(element => {
        // Click event
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showHCPList(country);
        });
        
        // Hover effects
        element.addEventListener('mouseenter', (e) => {
          element.style.strokeWidth = '2';
          element.style.stroke = '#22c55e';
          this.showCountryTooltip(e, country, element.hcpCount);
        });
        
        element.addEventListener('mouseleave', (e) => {
          element.style.strokeWidth = '1';
          element.style.stroke = '#ffffff';
          this.hideCountryTooltip();
        });
      });
    });
  }

  showCountryTooltip(event, country, hcpCount) {
    // Remove existing tooltip
    this.hideCountryTooltip();
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'country-tooltip';
    tooltip.innerHTML = `
      <h3>${country}</h3>
      <p><strong>${hcpCount}</strong> Healthcare Provider${hcpCount !== 1 ? 's' : ''}</p>
      <p>Click to view providers</p>
    `;
    
    // Position tooltip
    tooltip.style.position = 'absolute';
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY - 10 + 'px';
    tooltip.style.zIndex = '1000';
    
    document.body.appendChild(tooltip);
  }

  hideCountryTooltip() {
    const existingTooltip = document.querySelector('.country-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
  }

  addCountryMarkers() {
    // This method is now handled by initializeSVGInteractions
    // SVG countries are colored and made interactive there
  }

  addLegend() {
    // Legend removed - color guide is now in the page text
  }

  showHCPList(country) {
    this.currentCountry = country;
    this.allHcpList = getCountryData(country);
    
    // Update country title with current language
    const currentLang = getCurrentLanguage ? getCurrentLanguage() : 'en';
    document.getElementById('countryTitle').textContent = `${getTranslation('Healthcare Providers in', currentLang)} ${country}`;
    
    // Clear search input
    const searchInput = document.getElementById('hcpSearch');
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Initialize HCP search functionality
    this.initializeHCPSearch();
    
    // Display all HCPs initially
    this.displayHCPList(this.allHcpList);
    
    // Show the list container
    document.getElementById('hcpListContainer').style.display = 'block';
    
    // Scroll to the list
    document.getElementById('hcpListContainer').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }

  displayHCPList(hcpList) {
    // Clear existing list
    const listContainer = document.getElementById('hcpList');
    listContainer.innerHTML = '';
    
    if (hcpList.length === 0) {
      const currentLang = getCurrentLanguage ? getCurrentLanguage() : 'en';
      listContainer.innerHTML = `<p class="no-providers">${getTranslation('No healthcare providers found for this country.', currentLang)}</p>`;
    } else {
      hcpList.forEach(hcp => {
        const hcpElement = this.createHCPElement(hcp);
        listContainer.appendChild(hcpElement);
      });
    }
  }

  initializeHCPSearch() {
    const searchInput = document.getElementById('hcpSearch');
    const clearBtn = document.getElementById('clearHcpSearch');
    
    if (!searchInput || !clearBtn) return;
    
    // Remove existing listeners
    searchInput.removeEventListener('input', this.handleHCPSearch);
    clearBtn.removeEventListener('click', this.clearHCPSearch);
    
    // Add new listeners
    this.handleHCPSearch = this.handleHCPSearch.bind(this);
    this.clearHCPSearch = this.clearHCPSearch.bind(this);
    
    searchInput.addEventListener('input', this.handleHCPSearch);
    clearBtn.addEventListener('click', this.clearHCPSearch);
  }
  
  handleHCPSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.currentSearchTerm = searchTerm;
    
    if (searchTerm === '') {
      this.displayHCPList(this.allHcpList);
      return;
    }
    
    const filteredHCPs = this.allHcpList.filter(hcp => {
      return (
        hcp.name.toLowerCase().includes(searchTerm) ||
        hcp.title.toLowerCase().includes(searchTerm) ||
        hcp.city.toLowerCase().includes(searchTerm) ||
        hcp.state.toLowerCase().includes(searchTerm) ||
        hcp.hospital.toLowerCase().includes(searchTerm) ||
        hcp.info.toLowerCase().includes(searchTerm)
      );
    });
    
    this.displayHCPList(filteredHCPs);
  }
  
  clearHCPSearch() {
    const searchInput = document.getElementById('hcpSearch');
    if (searchInput) {
      searchInput.value = '';
      this.currentSearchTerm = '';
      this.displayHCPList(this.allHcpList);
    }
  }
  
  highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  createHCPElement(hcp) {
    const div = document.createElement('div');
    div.className = 'hcp-item';
    div.onclick = () => this.showHCPDetails(hcp);
    
    // Parse info tags
    const infoTags = hcp.info ? hcp.info.split(', ').filter(tag => tag.trim()) : [];
    
    // Get current language for translations
    const currentLang = getCurrentLanguage ? getCurrentLanguage() : 'en';
    
    // Apply highlighting if there's a search term
    const searchTerm = this.currentSearchTerm || '';
    const highlightedName = this.highlightSearchTerm(hcp.name || getTranslation('Name not provided', currentLang), searchTerm);
    const highlightedTitle = this.highlightSearchTerm(hcp.title || getTranslation('Specialty not specified', currentLang), searchTerm);
    const highlightedCity = this.highlightSearchTerm(hcp.city || '', searchTerm);
    const highlightedState = this.highlightSearchTerm(hcp.state || '', searchTerm);
    const highlightedHospital = this.highlightSearchTerm(hcp.hospital || '', searchTerm);
    const highlightedContact = this.highlightSearchTerm(hcp.contact || '', searchTerm);
    const highlightedNotes = this.highlightSearchTerm(hcp.notes || '', searchTerm);
    
    div.innerHTML = `
      <h3 class="hcp-name">${highlightedName}</h3>
      <p class="hcp-specialty">${highlightedTitle}</p>
      <p class="hcp-location">${highlightedCity}${hcp.state ? `, ${highlightedState}` : ''}</p>
      ${hcp.hospital ? `<p class="hcp-hospital">${highlightedHospital}</p>` : ''}
      ${hcp.contact ? `<p class="hcp-contact">${highlightedContact}</p>` : ''}
      ${infoTags.length > 0 ? `
        <div class="hcp-tags">
          ${infoTags.map(tag => `<span class="hcp-tag">${this.highlightSearchTerm(tag, searchTerm)}</span>`).join('')}
        </div>
      ` : ''}
      ${hcp.notes ? `<p class="hcp-notes">${highlightedNotes}</p>` : ''}
    `;
    
    return div;
  }

  showHCPDetails(hcp) {
    const modal = document.getElementById('hcpModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Get current language for translations
    const currentLang = getCurrentLanguage ? getCurrentLanguage() : 'en';
    
    modalTitle.textContent = hcp.name || getTranslation('Provider Details', currentLang);
    
    // Parse info tags
    const infoTags = hcp.info ? hcp.info.split(', ').filter(tag => tag.trim()) : [];
    
    modalBody.innerHTML = `
      <div class="provider-detail">
        <div class="detail-section">
          <div class="detail-label">${getTranslation('Name', currentLang)}</div>
          <div class="detail-value">${hcp.name || getTranslation('Not provided', currentLang)}</div>
        </div>
        
        <div class="detail-section">
          <div class="detail-label">${getTranslation('Specialty', currentLang)}</div>
          <div class="detail-value">${hcp.title || getTranslation('Not specified', currentLang)}</div>
        </div>
        
        <div class="detail-section">
          <div class="detail-label">${getTranslation('Location', currentLang)}</div>
          <div class="detail-value">${hcp.city}${hcp.state ? `, ${hcp.state}` : ''}</div>
        </div>
        
        ${hcp.hospital ? `
        <div class="detail-section">
          <div class="detail-label">${getTranslation('Hospital/Institution', currentLang)}</div>
          <div class="detail-value">${hcp.hospital}</div>
        </div>
        ` : ''}
        
        ${hcp.contact ? `
        <div class="detail-section">
          <div class="detail-label">${getTranslation('Contact Information', currentLang)}</div>
          <div class="detail-value contact">${hcp.contact}</div>
        </div>
        ` : ''}
        
        ${infoTags.length > 0 ? `
        <div class="detail-section">
          <div class="detail-label">${getTranslation('Additional Information', currentLang)}</div>
          <div class="detail-value">
            <div class="hcp-tags">
              ${infoTags.map(tag => `<span class="hcp-tag">${tag}</span>`).join('')}
            </div>
          </div>
        </div>
        ` : ''}
        
        ${hcp.notes ? `
        <div class="detail-section">
          <div class="detail-label">${getTranslation('Notes', currentLang)}</div>
          <div class="detail-value notes">${hcp.notes}</div>
        </div>
        ` : ''}
        
        ${hcp.recommender ? `
        <div class="detail-section">
          <div class="detail-label">${getTranslation('Recommended by', currentLang)}</div>
          <div class="detail-value">${hcp.recommender}</div>
        </div>
        ` : ''}
      </div>
    `;
    
    modal.style.display = 'flex';
  }

  setupEventListeners() {
    // Close HCP list
    document.getElementById('closeHcpList').addEventListener('click', () => {
      document.getElementById('hcpListContainer').style.display = 'none';
      this.currentCountry = null;
    });

    // Close modal
    document.getElementById('closeModal').addEventListener('click', () => {
      document.getElementById('hcpModal').style.display = 'none';
    });

    // Close modal when clicking outside
    document.getElementById('hcpModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('hcpModal')) {
        document.getElementById('hcpModal').style.display = 'none';
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('hcpModal').style.display = 'none';
        document.getElementById('hcpListContainer').style.display = 'none';
      }
    });
  }

  // Method to fit map to show all markers
  fitToMarkers() {
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // Method to highlight a specific country
  highlightCountry(country) {
    this.markers.forEach(marker => {
      if (marker.country === country) {
        marker.setStyle({
          fillColor: '#f59e0b',
          color: '#ffffff',
          weight: 3
        });
      } else {
        marker.setStyle({
          fillColor: '#22c55e',
          color: '#ffffff',
          weight: 2
        });
      }
    });
  }

  initializeZoom() {
    const svg = document.querySelector('#hcpMap svg');
    if (!svg) return;

    // Set initial viewBox
    const viewBox = svg.getAttribute('viewBox') || '0 0 2000 1000';
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    
    // Store original viewBox
    this.originalViewBox = viewBox;
    this.currentScale = 1;
    this.currentX = x;
    this.currentY = y;
    this.currentWidth = width;
    this.currentHeight = height;
    
    // Add zoom controls
    this.setupZoomControls();
    this.setupMouseWheelZoom();
    this.setupPan();
  }

  setupZoomControls() {
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetBtn = document.getElementById('resetView');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => this.zoomIn());
    }
    
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => this.zoomOut());
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetView());
    }
  }

  setupMouseWheelZoom() {
    const svg = document.querySelector('#hcpMap svg');
    if (!svg) return;

    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoomToPoint(mouseX, mouseY, zoomFactor);
    });
  }

  setupPan() {
    const svg = document.querySelector('#hcpMap svg');
    if (!svg) return;

    let isPanning = false;
    let startX, startY;

    svg.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        svg.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isPanning) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        this.pan(deltaX, deltaY);
        startX = e.clientX;
        startY = e.clientY;
      }
    });

    document.addEventListener('mouseup', () => {
      isPanning = false;
      svg.style.cursor = 'grab';
    });

    svg.addEventListener('mouseleave', () => {
      isPanning = false;
      svg.style.cursor = 'grab';
    });
  }

  zoomIn() {
    this.zoom(1.2);
  }

  zoomOut() {
    this.zoom(0.8);
  }

  zoom(factor) {
    const svg = document.querySelector('#hcpMap svg');
    if (!svg) return;

    this.currentScale *= factor;
    this.currentWidth /= factor;
    this.currentHeight /= factor;
    
    // Center the zoom
    this.currentX += (this.currentWidth * (1 - factor)) / 2;
    this.currentY += (this.currentHeight * (1 - factor)) / 2;
    
    this.updateViewBox();
  }

  zoomToPoint(x, y, factor) {
    const svg = document.querySelector('#hcpMap svg');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const svgWidth = rect.width;
    const svgHeight = rect.height;
    
    // Calculate point in SVG coordinates
    const pointX = (x / svgWidth) * this.currentWidth + this.currentX;
    const pointY = (y / svgHeight) * this.currentHeight + this.currentY;
    
    // Zoom
    this.currentScale *= factor;
    this.currentWidth /= factor;
    this.currentHeight /= factor;
    
    // Adjust position to zoom towards the point
    this.currentX = pointX - (x / svgWidth) * this.currentWidth;
    this.currentY = pointY - (y / svgHeight) * this.currentHeight;
    
    this.updateViewBox();
  }

  pan(deltaX, deltaY) {
    const svg = document.querySelector('#hcpMap svg');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const scaleX = this.currentWidth / rect.width;
    const scaleY = this.currentHeight / rect.height;
    
    this.currentX -= deltaX * scaleX;
    this.currentY -= deltaY * scaleY;
    
    this.updateViewBox();
  }

  resetView() {
    const svg = document.querySelector('#hcpMap svg');
    if (!svg) return;

    this.currentScale = 1;
    const [x, y, width, height] = this.originalViewBox.split(' ').map(Number);
    this.currentX = x;
    this.currentY = y;
    this.currentWidth = width;
    this.currentHeight = height;
    
    this.updateViewBox();
  }

  updateViewBox() {
    const svg = document.querySelector('#hcpMap svg');
    if (!svg) return;

    // Limit zoom levels
    const minScale = 0.5;
    const maxScale = 5;
    
    if (this.currentScale < minScale) {
      this.currentScale = minScale;
      this.currentWidth = this.originalViewBox.split(' ')[2] / this.currentScale;
      this.currentHeight = this.originalViewBox.split(' ')[3] / this.currentScale;
    } else if (this.currentScale > maxScale) {
      this.currentScale = maxScale;
      this.currentWidth = this.originalViewBox.split(' ')[2] / this.currentScale;
      this.currentHeight = this.originalViewBox.split(' ')[3] / this.currentScale;
    }
    
    const newViewBox = `${this.currentX} ${this.currentY} ${this.currentWidth} ${this.currentHeight}`;
    svg.setAttribute('viewBox', newViewBox);
  }
}

// Initialize the map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.hcpMap = new HCPMap();
  
  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();
});

// Add some utility functions for external use
window.HCPMapUtils = {
  showCountry: (country) => {
    if (window.hcpMap) {
      window.hcpMap.showHCPList(country);
      window.hcpMap.highlightCountry(country);
    }
  },
  
  fitToAllMarkers: () => {
    if (window.hcpMap) {
      window.hcpMap.fitToMarkers();
    }
  }
};
