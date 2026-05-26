const fs = require('node:fs');
const path = require('path');

// takes a .json file and reads it into an object
function readJSON(fileName = "db.json", localPath = "./config/") {
    const dirPath = path.join(__dirname, "../../" + localPath);
    try {
        const data = fs.readFileSync(dirPath + fileName, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading file: ' + dirPath + fileName);
        return null;
    }
}

function writeJSON(data, fileName = "db.json", localPath = "./config/") {
    const dirPath = path.join(__dirname, "../../" + localPath);
    // Write the updated JSON back to the file
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`Created Folder`);
        }
        fs.writeFileSync(dirPath + fileName, JSON.stringify(data, null, 2));
    } catch {
        console.error("Error saving data to: " + dirPath + fileName);
        return null;
    }
}

module.exports = { readJSON, writeJSON }