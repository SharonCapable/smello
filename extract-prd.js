const fs = require('fs');

async function extractText() {
    try {
        const { default: pdf } = await import('pdf-parse');
        const filePath = 'C:/Users/Sharon/Videos/Wizzle/webapps/smello/Product Requirements Document (PRD) - Smello for Teams.pdf';
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        console.log('---START---');
        console.log(data.text);
        console.log('---END---');
    } catch (error) {
        console.error('Error:', error);
    }
}

extractText();
