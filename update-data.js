#!/usr/bin/env node

/**
 * Update script for The Wandering Inn Progress Tracker
 *
 * This script fetches the latest table of contents and word counts
 * from the live URLs, parses them, and updates the local JSON files.
 *
 * Usage: node update-data.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TOC_URL = 'https://wanderinginn.com/table-of-contents/?compare=audio,ebook';
const WORDCOUNT_URL = 'https://innwords.pallandor.com/components/wordcount?min_chapter=1.00&max_chapter=Latest&format=json';

const CHAPTERS_OUTPUT = path.join(__dirname, 'wandering-inn-chapters.json');
const WORDCOUNT_OUTPUT = path.join(__dirname, 'wandering-inn-wordcount.json');

// Helper function to extract chapters from an element
function extractChaptersFromElement(element, volumeIndex, bookIndex, chaptersArray) {
  if (!element) return;

  // Look for chapter-entry divs (the actual structure used)
  const chapterEntries = element.querySelectorAll('.chapter-entry');

  if (chapterEntries.length > 0) {
    chapterEntries.forEach(entry => {
      try {
        // Get the three possible columns
        const wsCell = entry.querySelector('.body-web');
        const abCell = entry.querySelector('.body-audiobook');
        const ebCell = entry.querySelector('.body-ebook');

        // Extract text content and handle <br> tags properly
        const getChapterTexts = (cell) => {
          if (!cell) return [null];

          try {
            // Use innerHTML to preserve br tags, then split on them
            const html = cell.innerHTML.trim();
            if (!html) return [null];

            // Split by <br> tags (case insensitive, with or without attributes)
            const parts = html.split(/<br\s*\/?>/i);

            // Extract text from each part (removing HTML tags)
            const texts = parts
              .map(part => {
                // Create a temporary element to extract text content
                const temp = new JSDOM(`<div>${part}</div>`).window.document.querySelector('div');
                return temp.textContent.trim();
              })
              .filter(text => text && text.length > 0);

            return texts.length > 0 ? texts : [null];
          } catch (e) {
            console.error('Error parsing chapter text:', e);
            return [null];
          }
        };

        const wsTexts = getChapterTexts(wsCell);
        const abTexts = getChapterTexts(abCell);
        const ebTexts = getChapterTexts(ebCell);

        // Create entries for all combinations
        // The web serial chapter is the "anchor" - if multiple audiobook/ebook chapters
        // map to one web serial chapter, we repeat the web serial chapter
        const maxLength = Math.max(wsTexts.length, abTexts.length, ebTexts.length);

        for (let i = 0; i < maxLength; i++) {
          // For web serial, always use the first (or only) entry
          const ws = wsTexts[0];
          // For audiobook/ebook, use the indexed entry or null
          const ab = abTexts[i] || null;
          const eb = ebTexts[i] || null;

          // Skip if all are null
          if (!ws && !ab && !eb) continue;

          chaptersArray.push({
            v: volumeIndex,
            b: bookIndex,
            ws: ws,
            ab: ab,
            eb: eb
          });
        }
      } catch (e) {
        console.error('Error processing chapter entry:', e);
      }
    });
  } else {
    // Fallback: try table-based structure
    const rows = element.querySelectorAll('tr');

    rows.forEach(row => {
      try {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const wsText = cells[0]?.textContent.trim() || '';
          const abText = cells[1]?.textContent.trim() || '';
          const ebText = cells[2]?.textContent.trim() || '';

          // Skip empty or header rows
          if (!wsText && !abText && !ebText) return;
          if (wsText.match(/web\s*serial/i)) return;

          chaptersArray.push({
            v: volumeIndex,
            b: bookIndex,
            ws: wsText || null,
            ab: abText || null,
            eb: ebText || null
          });
        }
      } catch (e) {
        console.error('Error processing table row:', e);
      }
    });
  }
}

// Parse the table of contents HTML
function parseTableOfContents(htmlContent) {
  console.log('Parsing table of contents...');

  const dom = new JSDOM(htmlContent);
  const doc = dom.window.document;

  const volumes = [];
  const books = [];
  const chapters = [];

  let currentVolume = -1;
  let currentBook = -1;
  let volumeMap = {}; // Track volume names to indices
  let bookMap = {}; // Track book names to indices

  // Try to find the TOC container
  const tocContainer = doc.querySelector('#table-of-contents, .table-of-contents, main, body');
  if (!tocContainer) {
    throw new Error('Could not find table of contents container in HTML');
  }

  // Look for volume wrappers
  const volumeWrappers = tocContainer.querySelectorAll('[id^="vol-"], .volume-wrapper, .volume');

  if (volumeWrappers.length > 0) {
    // Div-based structure with volume wrappers
    console.log(`Found ${volumeWrappers.length} volume wrappers`);

    volumeWrappers.forEach((volumeWrapper, volIdx) => {
      try {
        // Extract volume name
        const volumeHeading = volumeWrapper.querySelector('h2, h3, .volume-title, [class*="volume-name"]');
        let volumeName = volumeHeading?.textContent.trim() || `Volume ${volIdx + 1}`;

        if (!volumeMap[volumeName]) {
          volumeMap[volumeName] = volumes.length;
          volumes.push(volumeName);
          currentVolume = volumeMap[volumeName];
        } else {
          currentVolume = volumeMap[volumeName];
        }

        // Look for book sections within volume
        const bookWrappers = volumeWrapper.querySelectorAll('.book-wrapper');

        if (bookWrappers.length > 0) {
          bookWrappers.forEach((bookWrapper, bookIdx) => {
            try {
              // Extract book name from the header
              const bookTitleElement = bookWrapper.querySelector('.head-book-title, .book-title');
              let bookName = '';

              if (bookTitleElement) {
                // Get the book number and title
                const bookNum = bookTitleElement.querySelector('.book-title-num, a')?.textContent.trim() || '';
                const bookTitle = bookTitleElement.querySelector('.book-title-text')?.textContent.trim() || '';
                // Add proper spacing: "Book 1" + " - " + "The Wandering Inn"
                if (bookNum && bookTitle) {
                  bookName = `${bookNum} -${bookTitle}`;
                } else {
                  bookName = bookNum || bookTitle;
                }
              }

              // Fallback if no book name found
              if (!bookName) {
                bookName = `Book ${books.length + 1}`;
              }

              if (!bookMap[bookName]) {
                bookMap[bookName] = books.length;
                books.push(bookName);
                currentBook = bookMap[bookName];
              } else {
                currentBook = bookMap[bookName];
              }

              // Extract chapters from this book's body
              const bookBody = bookWrapper.querySelector('.book-body');
              if (bookBody) {
                extractChaptersFromElement(bookBody, currentVolume, currentBook, chapters);
              }
            } catch (bookError) {
              console.error('Error processing book wrapper:', bookError);
            }
          });
        } else {
          // No book sections, extract chapters directly from volume
          if (currentBook === -1) {
            currentBook = 0;
            if (books.length === 0) books.push(`Book ${books.length + 1}`);
          }
          extractChaptersFromElement(volumeWrapper, currentVolume, currentBook, chapters);
        }

        console.log(`Processed volume ${volIdx + 1} of ${volumeWrappers.length}: ${volumeName}`);
      } catch (volumeError) {
        console.error('Error processing volume wrapper:', volumeError);
      }
    });
  } else {
    // Try table-based structure
    const table = tocContainer.querySelector('table');

    if (table) {
      console.log('Found table-based structure');
      const rows = table.querySelectorAll('tr');

      rows.forEach((row, rowIndex) => {
        try {
          // Check for volume/book headers
          const headerCell = row.querySelector('th');
          if (headerCell) {
            const headerText = headerCell.textContent.trim();

            if (headerText.match(/Volume\s+\d+/i)) {
              if (!volumeMap[headerText]) {
                volumeMap[headerText] = volumes.length;
                volumes.push(headerText);
              }
              currentVolume = volumeMap[headerText];
              return;
            }

            if (headerText.match(/Book\s+\d+/i)) {
              if (!bookMap[headerText]) {
                bookMap[headerText] = books.length;
                books.push(headerText);
              }
              currentBook = bookMap[headerText];
              return;
            }
          }

          // Extract chapter data from cells
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            // Infer volume/book if not set
            if (currentVolume === -1) {
              currentVolume = 0;
              if (volumes.length === 0) volumes.push('Volume 1');
            }
            if (currentBook === -1) {
              currentBook = 0;
              if (books.length === 0) books.push('Book 1');
            }

            const wsText = cells[0]?.textContent.trim() || '';
            const abText = cells[1]?.textContent.trim() || '';
            const ebText = cells[2]?.textContent.trim() || '';

            // Skip header rows
            if (wsText.match(/web\s*serial/i) || wsText.match(/audiobook/i)) return;
            if (!wsText && !abText && !ebText) return;

            chapters.push({
              v: currentVolume,
              b: currentBook,
              ws: wsText || null,
              ab: abText || null,
              eb: ebText || null
            });
          }
        } catch (rowError) {
          console.error('Error processing row:', rowError);
        }
      });
    } else {
      throw new Error('Could not find table or volume structure in HTML');
    }
  }

  // If we didn't find any volumes/books, create defaults
  if (volumes.length === 0) volumes.push('Volume 1');
  if (books.length === 0) books.push('Book 1');

  if (chapters.length === 0) {
    throw new Error('No chapters found in the HTML. Please check the file format.');
  }

  const parsedData = { volumes, books, chapters };

  console.log(`✓ Found ${volumes.length} volumes, ${books.length} books, ${chapters.length} chapters`);

  return parsedData;
}

// Fetch and parse word count data
async function fetchWordCount() {
  console.log('Fetching word count data...');
  console.log(`URL: ${WORDCOUNT_URL}`);

  const response = await fetch(WORDCOUNT_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch word count: ${response.status}`);
  }

  const data = await response.json();
  const chapters = data.chapters || data;

  // Convert to compact format
  const compactData = {};
  if (Array.isArray(chapters)) {
    chapters.forEach(entry => {
      if (entry.chapter_name && entry.wordcount) {
        compactData[entry.chapter_name] = entry.wordcount;
      }
    });
  } else {
    // Already in compact format
    Object.assign(compactData, chapters);
  }

  console.log(`✓ Loaded ${Object.keys(compactData).length} word count entries`);

  return compactData;
}

// Fetch and parse table of contents
async function fetchTableOfContents() {
  console.log('Fetching table of contents...');
  console.log(`URL: ${TOC_URL}`);

  const response = await fetch(TOC_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch TOC: ${response.status}`);
  }

  const html = await response.text();
  return parseTableOfContents(html);
}

// Main function
async function main() {
  console.log('🏰 The Wandering Inn Data Updater\n');
  console.log('Starting data update...\n');

  try {
    // Fetch both data sources
    console.log('--- Fetching Table of Contents ---');
    const chaptersData = await fetchTableOfContents();

    console.log('\n--- Fetching Word Counts ---');
    const wordCountData = await fetchWordCount();

    // Write to files
    console.log('\n--- Saving Files ---');

    console.log(`Writing chapters to ${CHAPTERS_OUTPUT}...`);
    fs.writeFileSync(
      CHAPTERS_OUTPUT,
      JSON.stringify(chaptersData, null, 2),
      'utf8'
    );
    console.log('✓ Chapters saved successfully');

    console.log(`Writing word counts to ${WORDCOUNT_OUTPUT}...`);
    fs.writeFileSync(
      WORDCOUNT_OUTPUT,
      JSON.stringify(wordCountData, null, 2),
      'utf8'
    );
    console.log('✓ Word counts saved successfully');

    console.log('\n✅ Update complete!');
    console.log(`   Total chapters: ${chaptersData.chapters.length}`);
    console.log(`   Total word count entries: ${Object.keys(wordCountData).length}`);
    console.log(`   Total words: ${Object.values(wordCountData).reduce((sum, count) => sum + count, 0).toLocaleString()}`);

  } catch (error) {
    console.error('\n❌ Error updating data:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
