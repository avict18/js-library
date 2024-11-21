const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Set up multer for file uploads
const upload = multer({
  dest: 'uploads/', // Directory to store uploaded files
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Serve static files from the 'public' and 'styling' directories
app.use(express.static('public')); // For general static files (like JS or images)
app.use(express.static('styling')); // Serve CSS files from 'styling' folder

// Handle file upload and store original filenames
app.post('/upload', upload.single('file'), (req, res) => {
  // The original filename
  const originalName = req.file.originalname;

  // Move the file to its correct location with the original name
  const newPath = path.join('uploads', originalName);
  fs.rename(req.file.path, newPath, (err) => {
    if (err) return res.status(500).send('Error moving file: ' + err);

    // Redirect to the files page
    res.redirect('/files');
  });
});

// Serve the list of uploaded files with updated card design
app.get('/files', (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory: ' + err);
    }

    // Map files to the consistent card structure
    let fileCards = files.map(file => {
      const filePath = `/uploads/${file}`;
      const fileType = path.extname(file).toLowerCase();

      // Set the status text and color based on file extension
      let statusText = 'Unknown';
      let statusColor = 'bg-gray-500'; // Default color

      if (['.jpg', '.png', '.gif', '.webp','.jfif'].includes(fileType)) {
        statusText = 'Image';
        statusColor = 'bg-blue-500'; // Blue for image files
      } else if (fileType === '.xlsx') {
        statusText = 'Spreadsheet';
        statusColor = 'bg-green-500'; // Green for Excel files
      } else if (fileType === '.css') {
        statusText = 'CSS';
        statusColor = 'bg-cyan-500'; // White for CSS files
      } else if (fileType === '.js') {
        statusText = 'JavaScript';
        statusColor = 'bg-yellow-500'; // Yellow for JS files
      } else if (fileType === '.docx') {
        statusText = 'Document';
        statusColor = 'bg-blue-500'; // Blue for Word documents
      } else if (fileType === '.html') {
        statusText = 'HTML';
        statusColor = 'bg-orange-500'; // Orange for HTML files
      } else if (fileType === '.zip') {
        statusText = 'ZIP';
        statusColor = 'bg-yellow-500'; // Yellow for ZIP files
      } else if (fileType === '.pdf'){
        statusText = 'PDF';
        statusColor = 'bg-red-500';
      } else if (fileType === '.7z') {
        statusText = '7z';
        statusColor = 'bg-red-500'; // Yellow for ZIP files
      }else if (fileType === '.exe') {
        statusText = 'EXE';
        statusColor = 'bg-teal-500'; // Yellow for ZIP files
      }else if (fileType === '.pptx'|| fileType === '.pptx') {
        statusText = 'PPT';
        statusColor = 'bg-teal-500'; // Yellow for ZIP files
      }else if (fileType === '.cpp') {
        statusText = 'CPP';
        statusColor = 'bg-blue-500'; // Yellow for ZIP files
      }

      // Return the consistent card design with color-coding
      return `  
        <div>
          <div class="bg-zinc-800  h-40 w-80 rounded-2xl p-3 shadow-md flex flex-col justify-between">
            <div class="flex justify-between">
              <div class="border-4 rounded-3xl p-1 ${statusColor} flex items-center space-x-1">
                <svg width="24" height="24" class="text-white">
                  <circle cx="12" cy="12" r="10" fill="${statusColor}" />
                </svg>
                <p class="text-white font-bold">${statusText}</p>
              </div>
              <div>
                <p class="text-zinc-400 text-sm">${new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div class="font-bold text-sm text-white truncate">${file}</div>
            <button class="bg-cyan-500 hover:bg-cyan-300 text-white mt-3 py-2 px-4 rounded text-center">
              <a class="font-bold" href="${filePath}">View file</a>
            </button>
          </div>
        </div>
      `;
    }).join(''); // Join the file cards into a single string

    // Send the HTML response
    res.send(`
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="http://192.168.8.45:3000/style.css" rel="stylesheet">
          <title>CS Library</title>
        </head>
        <body class="bg-gray-900 overflow-hidden">
          <div class="flex h-screen w-screen transition-all duration-200 max-h-screen" x-data="{ open: true }">
            <!-- Sidebar -->
            <div class="bg-black transition-all duration-200 h-screen overflow-hidden w-1/5">
              <p class="p-4 text-center text-white text-3xl font-semibold">
                <span class="text-red-600">CS</span> <span class="text-blue-500">Library</span>
              </p>
            </div>

            <!-- Content Area -->
            <div class="relative flex flex-col w-full">
              <!-- back Button -->
              <div class="flex justify-between">
                <button class="text-white p-4 ml-2 font-bold" @click="open = !open">
                  <a href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>

                  </a>
                </button>
                <p class="font-bold text-xl text-white mt-3">UPLOADED FILES</p>
                <p class="font-bold text-xl text-white m-3">by AVICT-18</p>
              </div>

              <!-- File Cards Content -->
              <div class="flex justify-center mt-3">
                <container class="bg-black rounded-2xl border border-2 border-gray-800 w-5/6 h-1/2 overflow-y-scroll">
                  <div class="flex flex-wrap justify-center p-6 gap-6">
                    ${fileCards}
                  </div>
                </container>
              </div>
              <p class="text-center text-xl text-white hover:text-cyan-500 m-2">Cybermaster&Avict18</p>
            </div>
          </div>
        </body>
      </html>
    `);
  });
});

// Serve uploaded files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(400).send({ error: err.message });
});

// Start the server
app.listen(port, '192.168.8.45', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
