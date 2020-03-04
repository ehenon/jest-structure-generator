#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
 
/**
 * Return a list of files of the specified fileTypes in the provided dir, with the file path relative to the given dir
 * @param {string} dir - Path of the directory you want to search the files for
 * @param {string} fileTypes - Array of file types you are searching for, ex: ['.txt', '.jpg']
 */
const getFilesFromDir = (dir, fileTypes) => {
  const filesToReturn = [];
  const walkDir = (currentPath) => {
    const files = fs.readdirSync(currentPath);
    for (let i in files) {
      const curFile = path.join(currentPath, files[i]);      
      if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
        filesToReturn.push(curFile.replace(dir, ''));
      } else if (fs.statSync(curFile).isDirectory()) {
       walkDir(curFile);
      }
    }
  };
  walkDir(dir);
  return filesToReturn;
}

/**
 * Return a string representing the Jest test structure of a specified file
 * @param {string} filePath File path
 * @returns {string} File Jest test structure
 */
const getJestTestStructure = (filePath) => {
  const fileName = filePath.split('\\').pop();
  let testStructure = 'beforeAll(() => {\n  /* Runs before all tests */\n})\n\n'
  testStructure += 'afterAll(() => {\n  /* Runs after all tests */\n})\n\n'
  testStructure += 'beforeEach(() => {\n  /* Runs before each test */\n})\n\n'
  testStructure += 'afterEach(() => {\n  /* Runs after each test */\n})\n'
  const importedFile = require('./' + filePath.replace('\\', '/'));
  const functionsInFile = Object.getOwnPropertyNames(importedFile).filter(item => typeof importedFile[item] === 'function');
  functionsInFile.forEach((item) => {
    testStructure += '\ndescribe(\'' + fileName + ': ' + item + '()\', () => {\n';
    testStructure += '  beforeEach(() => {\n    /* Runs before each test */\n  })\n\n'
    testStructure += '  afterEach(() => {\n    /* Runs after each test */\n  })\n\n'
    testStructure += '  test(\'Function ' + item + '(): OK\', () => {\n'
    testStructure += '    expect(true).toEqual(true)\n'
    testStructure += '  })\n\n'
    testStructure += '  test(\'Function ' + item + '(): KO\', () => {\n'
    testStructure += '    expect(false).toEqual(false)\n'
    testStructure += '  })\n'
    testStructure += '})\n'
  });
  return testStructure;
}
 
// Print the txt files in the current directory
const list = getFilesFromDir("./test/", [".js"]);

list.map((file) => {
  if (!file.includes('.spec.js')) {
    fs.writeFile(file.replace('.js', '.spec.js'), getJestTestStructure(file), { flag: 'wx' }, function (err) {
      if (!err) {
        console.log("File " + file.replace('.js', '.spec.js') + " created");
      }
    });
  }
});