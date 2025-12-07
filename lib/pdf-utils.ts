// PDF.js utilities with dynamic loading to avoid SSR issues

export const loadPdfJs = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be loaded in the browser');
  }
  
  try {
    // Dynamically import PDF.js only when needed
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source with fallback
    const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    
    console.log('PDF.js loaded successfully, version:', pdfjsLib.version);
    return pdfjsLib;
  } catch (error) {
    console.error('Failed to load PDF.js:', error);
    throw new Error('Failed to load PDF.js library. Please check your internet connection.');
  }
};

export const parsePdfDocument = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Please upload a PDF file.');
  }

  console.log('Starting PDF parsing for file:', file.name, 'Size:', file.size, 'bytes');
  
  try {
    const pdfjsLib = await loadPdfJs();
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      // Enable better text extraction
      disableAutoFetch: false,
      disableStream: false
    });
    
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    // Extract text from all pages (or first 10 for large documents)
    const maxPages = Math.min(pdf.numPages, 10);
    let textContent = '';
    
    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContentResult = await page.getTextContent({
          includeMarkedContent: true
        });
        
        const pageText = textContentResult.items
          .map((item: any) => {
            // Handle different text item structures
            if (item.str) return item.str;
            if (item.text) return item.text;
            return '';
          })
          .join(' ')
          .trim();
        
        if (pageText) {
          textContent += pageText + '\n';
        }
        
        console.log(`Page ${i} extracted, text length:`, pageText.length);
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${i}:`, pageError);
        // Continue with other pages
      }
    }
    
    // Clean up the text
    textContent = textContent
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    console.log('PDF parsing completed. Total text length:', textContent.length);
    
    if (textContent.length === 0) {
      throw new Error('No text could be extracted from the PDF. The PDF might be scanned images or encrypted.');
    }
    
    return textContent;
  } catch (error) {
    console.error('PDF parsing error:', error);
    
    if (error instanceof Error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
    
    throw new Error('Failed to parse PDF document. Please try a different file or check if the PDF is password protected.');
  }
};

// Helper function to validate PDF file
export const validatePdfFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Invalid file type. Please select a PDF file.' };
  }
  
  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Please select a PDF file smaller than 50MB.' };
  }
  
  // Check minimum file size (at least 1KB)
  if (file.size < 1024) {
    return { valid: false, error: 'File too small. Please select a valid PDF file.' };
  }
  
  return { valid: true };
};
