const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the directory path containing XML files: ', (directoryPath) => {
  rl.close();

  // Read all XML files from the directory
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    const xmlFiles = files.filter((file) => path.extname(file) === '.xml');

    if (xmlFiles.length < 2) {
      console.error('At least two XML files are required for merging.');
      return;
    }

    const parser = new xml2js.Parser({ explicitArray: false });
    const mergedEntities = [];

    // Read and parse each XML file
    xmlFiles.forEach((file, index) => {
      const xmlFilePath = path.join(directoryPath, file);
      const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');

      parser.parseString(xmlContent, (err, result) => {
        if (err) {
          console.error(`Error parsing ${xmlFilePath}: ${err}`);
          return;
        }

        if (result.CMapData && result.CMapData.entities) {
          mergedEntities.push(result.CMapData.entities);
        } else {
          console.error(`Invalid XML structure in ${xmlFilePath}`);
        }

        // If all XML files have been processed, merge and save
        if (index === xmlFiles.length - 1) {
          const mergedXmlObject = {
            CMapData: {
              entities: mergedEntities,
            },
          };

          const builder = new xml2js.Builder();
          const mergedXml = builder.buildObject(mergedXmlObject);

          // Write the merged XML to a file
          const mergedFilePath = './merged.xml'; // Update this to your desired output path
          fs.writeFileSync(mergedFilePath, mergedXml);

          console.log(`Merged ${xmlFiles.length} XML files successfully into ${mergedFilePath}`);
        }
      });
    });
  });
});
