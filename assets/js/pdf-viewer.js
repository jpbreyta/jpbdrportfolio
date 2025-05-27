// PDF Viewer functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    document.head.appendChild(script);

    script.onload = function() {
        console.log('PDF.js script loaded');
        
        // Initialize PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // Get the PDF viewer container
        const pdfViewer = document.getElementById('pdf-viewer');
        if (!pdfViewer) {
            console.error('PDF viewer container not found');
            return;
        }
        console.log('PDF viewer container found');

        let currentPage = 1;
        let currentScale = 1.5;
        let pdfDoc = null;

        // Function to load and display PDF
        function loadPDF(url) {
            console.log('Attempting to load PDF from:', url);
            pdfjsLib.getDocument(url).promise.then(function(pdf) {
                console.log('PDF loaded successfully');
                pdfDoc = pdf;
                document.getElementById('page-count').textContent = pdf.numPages;
                renderPage(currentPage);
            }).catch(function(error) {
                console.error('Error loading PDF:', error);
                pdfViewer.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Error Loading PDF</h4>
                        <p>There was an error loading the PDF file. Please check the following:</p>
                        <ul>
                            <li>The PDF file exists at: ${url}</li>
                            <li>You are accessing the page through a web server (not directly opening the HTML file)</li>
                            <li>Check the browser console (F12) for more details</li>
                        </ul>
                        <hr>
                        <p class="mb-0">Error details: ${error.message}</p>
                    </div>`;
            });
        }

        // Function to render a specific page
        function renderPage(pageNumber) {
            console.log('Rendering page:', pageNumber);
            pdfDoc.getPage(pageNumber).then(function(page) {
                const viewport = page.getViewport({ scale: currentScale });

                // Prepare canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                page.render(renderContext).promise.then(function() {
                    pdfViewer.innerHTML = '';
                    pdfViewer.appendChild(canvas);
                    document.getElementById('page-num').textContent = pageNumber;
                    console.log('Page rendered successfully');
                });
            }).catch(function(error) {
                console.error('Error rendering page:', error);
            });
        }

        // Navigation functions
        function goToPrevPage() {
            if (currentPage <= 1) return;
            currentPage--;
            renderPage(currentPage);
        }

        function goToNextPage() {
            if (currentPage >= pdfDoc.numPages) return;
            currentPage++;
            renderPage(currentPage);
        }

        function zoomIn() {
            currentScale += 0.25;
            renderPage(currentPage);
        }

        function zoomOut() {
            if (currentScale <= 0.5) return;
            currentScale -= 0.25;
            renderPage(currentPage);
        }

        // Add event listeners for navigation buttons
        document.getElementById('prev-page').addEventListener('click', goToPrevPage);
        document.getElementById('next-page').addEventListener('click', goToNextPage);
        document.getElementById('zoom-in').addEventListener('click', zoomIn);
        document.getElementById('zoom-out').addEventListener('click', zoomOut);

        // Check if we're on the dedicated PDF viewer page
        if (window.location.pathname.includes('pdf-viewer.html')) {
            console.log('On PDF viewer page, loading PDF...');
            // Load the PDF directly
            loadPDF('assets/pdf/RESUME REYTA.pdf');
        } else {
            console.log('On main page, setting up CV button...');
            // Add click event listener to the CV download button
            const cvButton = document.querySelector('a[href="#"]');
            if (cvButton) {
                cvButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = 'pdf-viewer.html';
                });
            }
        }
    };

    script.onerror = function(error) {
        console.error('Error loading PDF.js script:', error);
        const pdfViewer = document.getElementById('pdf-viewer');
        if (pdfViewer) {
            pdfViewer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error Loading PDF.js</h4>
                    <p>There was an error loading the PDF viewer library. Please check your internet connection and try again.</p>
                </div>`;
        }
    };
}); 