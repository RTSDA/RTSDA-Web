const bibleVerses = [
    {
        verse: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.",
        reference: "Jeremiah 29:11"
    },
    {
        verse: "Trust in the LORD with all your heart, and do not lean on your own understanding.",
        reference: "Proverbs 3:5"
    },
    {
        verse: "I can do all things through him who strengthens me.",
        reference: "Philippians 4:13"
    },
    {
        verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.",
        reference: "Joshua 1:9"
    },
    {
        verse: "The LORD is my shepherd; I shall not want.",
        reference: "Psalm 23:1"
    },
    {
        verse: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles.",
        reference: "Isaiah 40:31"
    },
    {
        verse: "Come to me, all who labor and are heavy laden, and I will give you rest.",
        reference: "Matthew 11:28"
    },
    {
        verse: "And we know that for those who love God all things work together for good.",
        reference: "Romans 8:28"
    },
    {
        verse: "The LORD is my light and my salvation; whom shall I fear?",
        reference: "Psalm 27:1"
    },
    {
        verse: "Be still, and know that I am God.",
        reference: "Psalm 46:10"
    }
];

function getRandomVerse() {
    const randomIndex = Math.floor(Math.random() * bibleVerses.length);
    return bibleVerses[randomIndex];
}

// Make getRandomVerse available globally for the splash screen
window.getRandomVerse = getRandomVerse;

function updateBibleVerse() {
    const verse = getRandomVerse();
    const verseElement = document.getElementById('bible-verse');
    const referenceElement = document.getElementById('bible-reference');
    
    if (verseElement) {
        verseElement.textContent = verse.verse;
    }
    if (referenceElement) {
        referenceElement.textContent = verse.reference;
    }
}

// Update verse every 10 seconds
setInterval(updateBibleVerse, 10000);

// Initial update
document.addEventListener('DOMContentLoaded', updateBibleVerse);

export { updateBibleVerse };
