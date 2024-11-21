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

// Serve node_modules statically to access Chart.js
app.use('/node_modules/chart.js', express.static(path.join(__dirname, 'node_modules/chart.js')));


// Handle file upload and store original filenames
app.post('/upload', upload.single('file'), (req, res) => {
  const originalName = req.file.originalname;

  // Move the file to its correct location with the original name
  const newPath = path.join('uploads', originalName);
  fs.rename(req.file.path, newPath, (err) => {
    if (err) return res.status(500).send('Error moving file: ' + err);

    res.redirect('/files');
  });
});

// Serve the list of uploaded files with updated card design
app.get('/files', (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory: ' + err);
    }

    // Statistics calculation
    const stats = {
      total: files.length,
      pdf: 0,
      word: 0,
      images: 0,
      ppt: 0,
      others: 0,
    };

    files.forEach(file => {
      const fileType = path.extname(file).toLowerCase();
      if (['.jpg', '.png', '.gif', '.webp', '.jfif'].includes(fileType)) {
        stats.images++;
      } else if (fileType === '.pdf') {
        stats.pdf++;
      } else if (['.docx', '.doc'].includes(fileType)) {
        stats.word++;
      } else if (['.pptx', '.ppt'].includes(fileType)) {
        stats.ppt++;
      } else {
        stats.others++;
      }
    });

    const fileCards = files.map(file => {
      const filePath = `/uploads/${file}`;
      const fileType = path.extname(file).toLowerCase();

      let statusText = 'Unknown';
      let statusColor = 'bg-gray-500';

      if (['.jpg', '.png', '.gif', '.webp', '.jfif'].includes(fileType)) {
        statusText = 'Image';
        statusColor = 'bg-blue-500';
      } else if (fileType === '.xlsx') {
        statusText = 'Spreadsheet';
        statusColor = 'bg-green-500';
      } else if (fileType === '.css') {
        statusText = 'CSS';
        statusColor = 'bg-cyan-500';
      } else if (fileType === '.js') {
        statusText = 'JavaScript';
        statusColor = 'bg-yellow-500';
      } else if (fileType === '.docx') {
        statusText = 'Document';
        statusColor = 'bg-blue-500';
      } else if (fileType === '.html') {
        statusText = 'HTML';
        statusColor = 'bg-orange-500';
      } else if (fileType === '.zip') {
        statusText = 'ZIP';
        statusColor = 'bg-yellow-500';
      } else if (fileType === '.pdf') {
        statusText = 'PDF';
        statusColor = 'bg-red-500';
      } else if (fileType === '.7z') {
        statusText = '7z';
        statusColor = 'bg-red-500';
      } else if (fileType === '.exe') {
        statusText = 'EXE';
        statusColor = 'bg-teal-500';
      } else if (['.pptx', '.ppt'].includes(fileType)) {
        statusText = 'PPT';
        statusColor = 'bg-teal-500';
      } else if (fileType === '.cpp') {
        statusText = 'CPP';
        statusColor = 'bg-blue-500';
      }

      return `
        <div>
          <div class="bg-zinc-800 h-40 w-80 rounded-2xl p-3 shadow-md flex flex-col justify-between">
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
    }).join('');

    res.send(`
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="http://192.168.8.45:3000/style.css" rel="stylesheet">
          <title>CS Library</title>
          <script src="/node_modules/chart.js/dist/chart.min.js"></script>
        </head>
        <body class="bg-gray-900 min-h-screen overflow-auto">
          <div class="flex h-screen w-screen">
            <aside class="bg-black h-screen overflow-hidden w-1/5 flex flex-col items-center p-4 text-white justify-between">
              <p class="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent m-3">
               CS Library
              </p>
              <div>
                <p class="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent mb-2">Statistics</p>
                <ul class="text-lg font-mono text-white w-full">
                  <li class="flex justify-between"><span>Total: </span><span class="text-blue-500 font-bold">${stats.total}</span></li>
                  <li class="flex justify-between"><span>Images: </span><span class="text-blue-500 font-bold">${stats.images}</span></li>
                  <li class="flex justify-between"><span>PDFs: </span><span class="text-red-500 font-bold">${stats.pdf}</span></li>
                  <li class="flex justify-between"><span>Word:</span> <span class="text-blue-500 font-bold">${stats.word}</span></li>
                  <li class="flex justify-between"><span>PPTs:</span> <span class="text-teal-500 font-bold">${stats.ppt}</span></li>
                  <li class="flex justify-between"><span>Others:</span> <span class="text-gray-500 font-bold">${stats.others}</span></li>
                </ul>
              </div>
              <div>
                <canvas id="fileStatsChart" width="200" height="200"></canvas>
              </div>
            </aside>
            <div class="relative flex flex-col w-full max-h-screen">
              <div class="flex justify-between">
                <button class="text-white p-4 ml-2 font-bold">
                  <a href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </a>
                </button>
                <p class="font-bold text-xl text-white mt-3">UPLOADED FILES</p>
                <p class="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent m-3 hover:bg-gradient-to-r hover:from-red-500 hover:to-blue-500 hover:via-purple-500 transition transition-all duration-400">
                  Wences & Avict18
                </p>
              </div>
              <div class="flex justify-center mt-3 h-5/6">
                <div class="bg-black rounded-2xl border border-2 border-gray-800 w-5/6 overflow-auto">
                  <div class="flex flex-wrap justify-center p-6 gap-6">
                    ${fileCards}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <script>
            const ctx = document.getElementById('fileStatsChart').getContext('2d');
            const statsChart = new Chart(ctx, {
              type: 'pie',
              data: {
                labels: ['Images', 'PDFs', 'Word Docs', 'PPTs', 'Others'],
                datasets: [{
                  data: [${stats.images}, ${stats.pdf}, ${stats.word}, ${stats.ppt}, ${stats.others}],
                  backgroundColor: ['#4F7BEC', '#F44336', '#1976D2', '#26A69A', '#9E9E9E'],
                }]
              }
            });
          </script>
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
  console.log(`Server running at http://192.168.8.45:${port}`);
});
