# 🏰 The Wandering Inn Progress Tracker

**Track your journey through THE GREATEST BOOK OF ALL TIME!**

## 📖 About The Wandering Inn

Let's get one thing straight: **[The Wandering Inn](https://wanderinginn.com)** by pirateaba is not just a book. It's an EPIC, MAGNIFICENT, ABSOLUTELY LIFE-CHANGING literary masterpiece that deserves to be read by EVERYONE! 🎉

This is:
- ✨ One of the longest fantasy series ever written (over **15 MILLION WORDS** and counting!)
- 🌟 A rich, complex world with hundreds of beloved characters
- 💎 Free to read as a web serial
- 🎧 Available as audiobooks narrated by the incredible Andrea Parsneau and Erin Bennett
- 📚 Published as ebooks for those who prefer that format

### "But... it's SO LONG. Where do I even start?"

**DON'T BE SCARED!**

Yes, The Wandering Inn is one of the longest books ever written. Yes, it might seem intimidating. But here's the truth: **You can absolutely start this journey, and it's easier than you think!**

Just like you wouldn't be scared to watch a long-running TV show one episode at a time, you can read The Wandering Inn one chapter at a time. Each chapter is a complete experience, and the story just keeps getting better and better!

**Start with Chapter 1.00.** That's it. Just one chapter. Then see how you feel. We guarantee you'll want to keep going! 🚀

## 🎯 What This Tool Does

This progress tracker helps you:

- **📊 Track your progress** across Web Serial, Audiobook, and Ebook formats
- **🗺️ Understand where you are** in the massive story (no more "wait, which volume am I in?")
- **📈 See your stats** - chapters read, words conquered, time invested
- **🔄 Cross-reference formats** - easily switch between audiobook and web serial
- **🎯 Set reading goals** - calculate when you'll catch up based on your reading speed
- **💪 Stay motivated** - watch your progress bars fill up!

The goal? **To help you confidently dive into this incredible story without feeling overwhelmed by its length.**

## 🚀 Try It Now

**👉 [Visit the Live Tracker](https://nyclitrpg.github.io/wanderinginn/)**

Just search for your current chapter and see all your progress stats instantly!

## 🛠️ Features

- ✅ **No installation required** - runs entirely in your browser
- ✅ **Tracks all formats** - Web Serial, Audiobook, and Ebook
- ✅ **Word count integration** - see exactly how many words you've read
- ✅ **Reading time calculator** - estimate when you'll finish

## 📂 Repository Structure

```
.
├── index.html                          # Main application (standalone HTML)
├── wandering-inn-chapters.json        # Chapter mapping data
├── wandering-inn-wordcount.json       # Word count data
├── update-data.js                      # Script to fetch latest data
├── package.json                        # Node.js dependencies
├── README.md                           # This file
├── LICENSE                             # MIT License
└── .gitignore                          # Git ignore rules
```

## 🔧 Local Development

Want to run this locally or contribute?

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nyclitrpg/wanderinginn.git
   cd wanderinginn
   ```

2. **Open in browser:**
   - Just open `index.html` in your web browser
   - That's it! No build process needed.

3. **Make changes:**
   - Edit `index.html` for UI/logic changes
   - Update JSON files for data changes
   - All dependencies are loaded from CDN

## 🔄 Updating Chapter Data

The chapter and word count data may become outdated as new chapters are released.

### Automated Update (Recommended)

Use the provided update script to automatically fetch and parse the latest data:

```bash
# First time only: Install dependencies
npm install

# Run the update script
npm run update
```

This will:
- Fetch the latest table of contents from [wanderinginn.com](https://wanderinginn.com/table-of-contents/?compare=audio,ebook)
- Fetch the latest word counts from [InnWords](https://innwords.pallandor.com)
- Parse and convert the data to the correct format
- Update `wandering-inn-chapters.json` and `wandering-inn-wordcount.json`

After running the script, commit and push the updated JSON files.

### Manual Update

Alternatively, manually update the data:

1. **Chapters:** Visit the [Table of Contents](https://wanderinginn.com/table-of-contents/?compare=audio,ebook), save the page, and parse it
2. **Word Counts:** Visit [InnWords](https://innwords.pallandor.com), download the JSON
3. Update the JSON files and push to the repository

## 🤝 Contributing

Found a bug? Have an idea for a feature? Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **[pirateaba](https://wanderinginn.com)** - for creating this incredible world
- **[InnWords](https://innwords.pallandor.com)** - for the word count data
- **The Wandering Inn community** - for being awesome!

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is a fan-made project and is not officially affiliated with pirateaba or The Wandering Inn. All rights to The Wandering Inn and its characters belong to pirateaba.

---

## 🎉 Ready to Start Your Journey?

Don't let the length intimidate you. Every reader started with Chapter 1.00, and they all agree: **it's worth it!**

**[Start reading now at WanderingInn.com](https://wanderinginn.com/2016/07/27/1-00/)** 📖

And use **[this tracker](https://nyclitrpg.github.io/wanderinginn/)** to watch your progress as you fall in love with Erin, Ryoka, Silverstache (yes, I have a personal favorite) and the countless other amazing characters you'll meet at The Wandering Inn!

*Welcome to the Inn. Please, have a seat. Can I get you a drink?* 🍺

(Oh, and *NO KILLING GOBLINS!*)
