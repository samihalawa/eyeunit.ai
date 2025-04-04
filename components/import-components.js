// Function to load HTML components
function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    fetch(componentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath}`);
            }
            return response.text();
        })
        .then(html => {
            element.innerHTML = html;
            
            // Execute scripts in the imported HTML
            const scripts = element.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                
                // Copy all attributes
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                
                // Copy the content
                newScript.textContent = script.textContent;
                
                // Replace the old script with the new one
                script.parentNode.replaceChild(newScript, script);
            });
        })
        .catch(error => {
            console.error(`Error loading component ${componentPath}:`, error);
        });
}

// Load components when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load head scripts if present
    loadComponent('head-scripts', '/components/head-scripts.html');
    
    // Load Google Analytics if present
    loadComponent('google-analytics', '/components/google-analytics.html');
    
    // Load navbar if present
    loadComponent('navbar', '/components/navbar.html');
    
    // Load footer if present
    loadComponent('footer', '/components/footer.html');
}); 