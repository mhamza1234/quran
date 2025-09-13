// প্রদত্ত JSON পেলোড
const quranPayload = {
    "surah": 67,
    "name_ar": "الملك",
    "name_bn": "সার্বভৌমত্ব",
    "verses": [
        {
            "ayah_id": "67:1",
            "arabic": "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
            "bangla": "মহিমান্বিত তিনি যার হাতে সার্বভৌমত্ব এবং তিনি সব কিছুর উপর ক্ষমতাবান।",
            "words": [
                {
                    "ar": "تَبَارَكَ",
                    "bn": "বরকতময়",
                    "tr": "tabāraka",
                    "root": "ب-ر-ك",
                    "pattern": "تَفَاعَلَ",
                    "derived": [
                        { "ar": "بَرَكَة", "bn": "বরকত", "pattern": "فَعَلَة" },
                        { "ar": "مُبَارَك", "bn": "বরকতময়", "pattern": "مُفَاعَل" },
                        { "ar": "بَارَكَ", "bn": "বরকত দেওয়া", "pattern": "فَاعَلَ" }
                    ]
                },
                {
                    "ar": "الَّذِي",
                    "bn": "যিনি",
                    "tr": "alladhī",
                    "root": "ا-ل-ل",
                    "pattern": "الَّذِي",
                    "derived": [
                        { "ar": "الَّتِي", "bn": "যে (স্ত্রীলিঙ্গ)", "pattern": "الَّتِي" },
                        { "ar": "الَّذِينَ", "bn": "যারা (পুরুষ বহুবচন)", "pattern": "الَّذِينَ" }
                    ]
                }
            ]
        },
        {
            "ayah_id": "67:2",
            "arabic": "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا",
            "bangla": "যিনি সৃষ্টি করেছেন মৃত্যু ও জীবন তোমাদের পরীক্ষা করার জন্য যে কে তোমাদের মধ্যে সর্বোত্তম কর্ম করে।",
            "words": [
                {
                    "ar": "الَّذِي",
                    "bn": "যিনি",
                    "tr": "alladhī",
                    "root": "ا-ل-ل",
                    "pattern": "الَّذِي",
                    "derived": [
                        { "ar": "الَّتِي", "bn": "যে (স্ত্রীলিঙ্গ)", "pattern": "الَّتِي" },
                        { "ar": "الَّذِينَ", "bn": "যারা (পুরুষ বহুবচন)", "pattern": "الَّذِينَ" }
                    ]
                }
            ]
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const surahContainer = document.getElementById('surah-container');
    renderSurah(quranPayload, surahContainer);
});

// মূল ফাংশন যা পুরো সূরা রেন্ডার করে
function renderSurah(data, container) {
    const surahHtml = `
        <h2 class="surah-title" lang="ar" dir="rtl">${data.name_ar}</h2>
        <h3 class="surah-title-bn" lang="bn" dir="ltr">${data.name_bn}</h3>
        <div class="verses-container">
            ${data.verses.map(verse => renderVerse(verse)).join('')}
        </div>
    `;
    container.innerHTML = surahHtml;
}

// প্রতিটি আয়াত রেন্ডার করার ফাংশন
function renderVerse(verseData) {
    const wordElementsHtml = verseData.words.map(word => createWordElement(word)).join(' ');
    return `
        <article class="verse" data-ayah-id="${verseData.ayah_id}">
            <p class="ayah-arabic" lang="ar" dir="rtl">${wordElementsHtml}</p>
            <p class="ayah-bangla" lang="bn" dir="ltr">${verseData.bangla}</p>
        </article>
    `;
}

// প্রতিটি শব্দের জন্য ইন্টারেক্টিভ এলিমেন্ট তৈরি করার ফাংশন
function createWordElement(wordData) {
    const tooltipHtml = createWordTooltip(wordData);
    const wordElement = document.createElement('span');
    wordElement.className = 'word-wrapper';
    wordElement.setAttribute('tabindex', '0'); // কীবোর্ড অ্যাক্সেসিবিলিটির জন্য
    wordElement.setAttribute('role', 'button');
    wordElement.setAttribute('aria-expanded', 'false');

    wordElement.innerHTML = `<span lang="ar" dir="rtl">${wordData.ar}</span>${tooltipHtml}`;

    // মাউস হোভার এবং ক্লিক ইভেন্ট লিসনার যোগ করা
    wordElement.addEventListener('click', (e) => toggleTooltip(e.currentTarget));
    wordElement.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget));
    wordElement.addEventListener('mouseleave', (e) => hideTooltip(e.currentTarget));
    wordElement.addEventListener('focus', (e) => showTooltip(e.currentTarget));
    wordElement.addEventListener('blur', (e) => hideTooltip(e.currentTarget));

    return wordElement.outerHTML; // টেমপ্লেট লিটারালের সাথে ব্যবহারের জন্য
}

// শব্দের বিস্তারিত তথ্যের জন্য টুলটিপ তৈরি করার ফাংশন
function createWordTooltip(wordData) {
    const derivedHtml = wordData.derived? `
        <div class="word-details-item word-derived">
            <strong>শব্দ থেকে উদ্ভূত:</strong>
            ${wordData.derived.map(d => `<span>${d.bn}</span>`).join(', ')}
        </div>
    ` : '';
    return `
        <div class="word-details" aria-hidden="true" hidden>
            <div class="word-details-item">
                <span>আরবি:</span> ${wordData.ar}
            </div>
            <div class="word-details-item">
                <span>বাংলা:</span> ${wordData.bn}
            </div>
            <div class="word-details-item">
                <span>ট্রান্সলিটারেশন:</span> ${wordData.tr}
            </div>
            <div class="word-details-item">
                <span>মূল:</span> ${wordData.root}
            </div>
            <div class="word-details-item">
                <span>গঠন:</span> ${wordData.pattern}
            </div>
            ${derivedHtml}
        </div>
    `;
}

// টুলটিপ টগল করার ফাংশন (ক্লিকের জন্য)
function toggleTooltip(element) {
    const tooltip = element.querySelector('.word-details');
    const isExpanded = element.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
        hideTooltip(element);
    } else {
        showTooltip(element);
    }
}

// টুলটিপ দেখানোর ফাংশন (হোভার/ক্লিকের জন্য)
function showTooltip(element) {
    const tooltip = element.querySelector('.word-details');
    tooltip.style.display = 'block';
    tooltip.setAttribute('aria-hidden', 'false');
    element.setAttribute('aria-expanded', 'true');
    // অ্যাক্সেসিবিলিটির জন্য ফোকাসযোগ্য উপাদান পুনরুদ্ধার
    const focusableElements = tooltip.querySelectorAll('button, a[href], input, select, textarea');
    focusableElements.forEach(el => el.removeAttribute('tabindex'));
}

// টুলটিপ লুকানোর ফাংশন (হোভার/ক্লিকের জন্য)
function hideTooltip(element) {
    const tooltip = element.querySelector('.word-details');
    tooltip.style.display = 'none';
    tooltip.setAttribute('aria-hidden', 'true');
    element.setAttribute('aria-expanded', 'false');
    // অ্যাক্সেসিবিলিটির জন্য ফোকাসযোগ্য উপাদান ট্যাব ক্রম থেকে সরানো
    const focusableElements = tooltip.querySelectorAll('button, a[href], input, select, textarea');
    focusableElements.forEach(el => el.setAttribute('tabindex', '-1'));
}
