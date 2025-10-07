// HCP Page specific functionality
document.addEventListener('DOMContentLoaded', async () => {
  // Footer removed - no year element to set
  
  // Theme toggle removed with header
  
  // Language switcher removed - using English only
  
  // Initialize navigator functionality
  try { await loadHcpDataFromSheet?.(); } catch (e) { console.warn('Sheet load failed', e); }
  initializeNavigator();
  initializeCountriesList();
});

// Theme toggle functionality removed with header

// Language functionality removed - using English only

// Translation object for dynamic content - English only
const translations = {
  en: {
    'Healthcare Providers in': 'Healthcare Providers in',
    'No healthcare providers found for this country.': 'No healthcare providers found for this country.',
    'Provider Details': 'Provider Details',
    'Name': 'Name',
    'Specialty': 'Specialty',
    'Location': 'Location',
    'Hospital/Institution': 'Hospital/Institution',
    'Contact Information': 'Contact Information',
    'Additional Information': 'Additional Information',
    'Notes': 'Notes',
    'Recommended by': 'Recommended by',
    'Not provided': 'Not provided',
    'Not specified': 'Not specified',
    'Specialty not specified': 'Specialty not specified',
    'Name not provided': 'Name not provided',
    'View Providers': 'View Providers',
    'provider': 'provider',
    'providers': 'providers'
  }
};

// Get translation - simplified to English only
function getTranslation(key) {
  return translations.en[key] || key;
}

// Get current language - always return English since language switcher is removed
function getCurrentLanguage() {
  return 'en';
}

// Page language update function removed - using English only

// Navigator functionality
function initializeNavigator() {
  const countrySearch = document.getElementById('countrySearch');
  const resetFilters = document.getElementById('resetFilters');
  
  // Update statistics
  updateStatistics();
  
  // Search functionality
  countrySearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterCountries(searchTerm);
  });
  
  // Reset search
  resetFilters.addEventListener('click', () => {
    countrySearch.value = '';
    resetCountryFilters();
  });
}

function updateStatistics() {
  const countries = getAllCountries();
  let totalProviders = 0;
  let activeCountries = 0;
  
  countries.forEach(country => {
    const providers = getCountryData(country);
    totalProviders += providers.length;
    if (providers.length > 0) {
      activeCountries++;
    }
  });
  
  document.getElementById('totalCountries').textContent = countries.length;
  document.getElementById('totalProviders').textContent = totalProviders;
  document.getElementById('activeCountries').textContent = activeCountries;
}

function filterCountries(searchTerm) {
  const countries = getAllCountries();
  const searchLower = searchTerm.toLowerCase();
  
  // Country name mapping from CSV to SVG
  const countryNameMap = {
    'United Kingdom': 'England / Great Britain', // CSV'de England / Great Britain
    'Netherlands': 'The Netherlands / Nederland', // CSV'de The Netherlands / Nederland
    'Czech Republic': 'Czech republic' // CSV'de Czech republic
  };
  
  countries.forEach(country => {
    // Get the search name (CSV name)
    const searchName = countryNameMap[country] || country;
    
    // Find country elements using a more robust method
    let countryElements = [];
    
    // Try multiple selectors to find the country
    const selectors = [
      `path[class="${country}"]`,          // Exact class match
      `.${CSS.escape(country)}`,           // CSS escaped selector
      `path[class*="${country}"]`          // Partial class match
    ];
    
    for (const selector of selectors) {
      try {
        countryElements = document.querySelectorAll(selector);
        if (countryElements.length > 0) break;
      } catch (e) {
        // CSS selector might be invalid, continue to next
        continue;
      }
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
        'United Kingdom': 'GB',
        'United States': 'US'
      };
      
      const countryCode = countryCodeMap[country];
      if (countryCode) {
        countryElements = document.querySelectorAll(`#${countryCode}`);
      }
    }
    
    // Filter based on search term - search both country name and CSV name
    const shouldShow = searchTerm === '' || 
      country.toLowerCase().includes(searchLower) || 
      searchName.toLowerCase().includes(searchLower);
    
    // Show/hide country and add highlight
    countryElements.forEach(element => {
      if (shouldShow) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
        // Add highlight if there's a search term and it matches
        if (searchTerm !== '' && (country.toLowerCase().includes(searchLower) || searchName.toLowerCase().includes(searchLower))) {
          element.classList.add('country-highlight');
        } else {
          element.classList.remove('country-highlight');
        }
      } else {
        element.style.opacity = '0.3';
        element.style.pointerEvents = 'none';
        element.classList.remove('country-highlight');
      }
    });
  });
  
  // Also filter the countries list below the map
  filterCountriesList(searchTerm);
}

function filterCountriesList(searchTerm) {
  const countryCards = document.querySelectorAll('.country-card');
  const searchLower = searchTerm.toLowerCase();
  
  // Country name mapping from CSV to SVG
  const countryNameMap = {
    'United Kingdom': 'England / Great Britain', // CSV'de England / Great Britain
    'Netherlands': 'The Netherlands / Nederland', // CSV'de The Netherlands / Nederland
    'Czech Republic': 'Czech republic' // CSV'de Czech republic
  };
  
  countryCards.forEach(card => {
    const countryName = card.querySelector('.country-name').textContent;
    const searchName = countryNameMap[countryName] || countryName;
    
    const shouldShow = searchTerm === '' || 
      countryName.toLowerCase().includes(searchLower) || 
      searchName.toLowerCase().includes(searchLower);
    
    card.style.display = shouldShow ? 'block' : 'none';
  });
}

function resetCountryFilters() {
  const countries = getAllCountries();
  
  countries.forEach(country => {
    // Find country elements using a more robust method
    let countryElements = [];
    
    // Try multiple selectors to find the country
    const selectors = [
      `path[class="${country}"]`,          // Exact class match
      `.${CSS.escape(country)}`,           // CSS escaped selector
      `path[class*="${country}"]`          // Partial class match
    ];
    
    for (const selector of selectors) {
      try {
        countryElements = document.querySelectorAll(selector);
        if (countryElements.length > 0) break;
      } catch (e) {
        // CSS selector might be invalid, continue to next
        continue;
      }
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
                'United Kingdom': 'GB',
                'United States': 'US'
              };
      
      const countryCode = countryCodeMap[country];
      if (countryCode) {
        countryElements = document.querySelectorAll(`#${countryCode}`);
      }
    }
    
    countryElements.forEach(element => {
      element.style.opacity = '1';
      element.style.pointerEvents = 'auto';
      element.classList.remove('country-highlight');
    });
  });
  
  // Also reset the countries list below the map
  const countryCards = document.querySelectorAll('.country-card');
  countryCards.forEach(card => {
    card.style.display = 'block';
  });
}

// Countries list functionality
function initializeCountriesList() {
  const countriesGrid = document.getElementById('countriesGrid');
  const countries = getAllCountries();
  
  // Sort countries by provider count (descending)
  const sortedCountries = countries.sort((a, b) => {
    const aCount = getCountryData(a).length;
    const bCount = getCountryData(b).length;
    return bCount - aCount;
  });
  
  // Create country cards
  sortedCountries.forEach(country => {
    const providers = getCountryData(country);
    const providerCount = providers.length;
    
    if (providerCount > 0) {
      const card = createCountryCard(country, providerCount);
      countriesGrid.appendChild(card);
    }
  });
}

function createCountryCard(country, providerCount) {
  const card = document.createElement('div');
  card.className = 'country-card';
  
  // Get color based on provider count
  const getColorIntensity = (count) => {
    if (count === 0) return '#f0f0f0';
    if (count <= 2) return '#d4f4dd';
    if (count <= 5) return '#a7f3d0';
    if (count <= 10) return '#6ee7b7';
    if (count <= 20) return '#34d399';
    return '#22c55e';
  };
  
  const color = getColorIntensity(providerCount);
  
  // Get current language for translations
  const currentLang = getCurrentLanguage();
  
  // Get color label with translation support
  const getColorLabel = (count, lang) => {
    if (count === 0) return getTranslation('No Providers', lang);
    if (count <= 2) return getTranslation('Limited', lang);
    if (count <= 5) return getTranslation('Some', lang);
    if (count <= 10) return getTranslation('Good', lang);
    if (count <= 20) return getTranslation('Excellent', lang);
    if (count <= 50) return getTranslation('Very Good', lang);
    if (count <= 100) return getTranslation('Outstanding', lang);
    return getTranslation('Exceptional', lang);
  };
  
  const colorLabel = getColorLabel(providerCount, currentLang);
  const providerText = providerCount === 1 ? 
    getTranslation('provider', currentLang) : 
    getTranslation('providers', currentLang);
  
  card.innerHTML = `
    <div class="country-header">
      <h4 class="country-name">${country}</h4>
      <div class="provider-count">${providerCount}</div>
    </div>
    <div class="country-info">
      <div class="color-indicator" style="background-color: ${color};"></div>
      <span class="color-label">${colorLabel} (${providerCount} ${providerText})</span>
    </div>
    <div class="country-action">
      <span class="action-text">${getTranslation('View Providers', currentLang)}</span>
    </div>
  `;
  
  // Add click event
  card.addEventListener('click', () => {
    if (window.hcpMap) {
      window.hcpMap.showHCPList(country);
    }
  });
  
  return card;
}

// Update country cards - simplified for English only
function updateCountryCards() {
  const countriesGrid = document.getElementById('countriesGrid');
  if (!countriesGrid) return;
  
  // Clear and rebuild all cards
  countriesGrid.innerHTML = '';
  initializeCountriesList();
}
