// Component Loader
document.addEventListener('DOMContentLoaded', function() {
  // Load components with the data-component attribute
  const componentElements = document.querySelectorAll('[data-component]');
  
  componentElements.forEach(element => {
    const componentPath = element.getAttribute('data-component');
    
    fetch(componentPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load component: ${componentPath}`);
        }
        return response.text();
      })
      .then(html => {
        element.innerHTML = html;
        
        // Execute any scripts in the loaded component
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          document.head.appendChild(newScript);
        });
      })
      .catch(error => {
        console.error('Error loading component:', error);
      });
  });
}); 