import { useState } from "react";

export function Home({ setPages }: { setPages: React.Dispatch<React.SetStateAction<string[]>> }) {
    
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedManga, setSelectedManga] = useState<string>("");
  const [chapterCount, setChapterCount] = useState<number | null>(null);
  const [chapterNumber, setChapterNumber] = useState<number | null>(null);

  const searchManga = async () => {
    const res = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=5&order[relevance]=desc&originalLanguage[]=ja`);
    const data = await res.json();
    setResults(data.data);
  };

  const fetchChapters = async (mangaId: string) => {
    let totalChapters = 0;
    let offset = 0;
    while (true) {
      const res = await fetch(`https://api.mangadex.org/chapter?manga=${mangaId}&limit=100&offset=${offset-1}&translatedLanguage[]=en&order[chapter]=asc`);
      const data = await res.json();
      totalChapters += data.data.length;
      if (data.data.length < 100) break;
      offset += 100;
    }
    setChapterCount(totalChapters);
  };

  const fetchPages = async (chapterId: string) => {
    const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
    const data = await res.json();
    const hash = data.chapter.hash;
    const baseUrl = data.baseUrl;
    const urls = (data.chapter.data.map((page: string) => `${baseUrl}/data/${hash}/${page}`));
    setPages(urls);
};

  const handleChapterFetch = async () => {
    if (chapterNumber !== null) {
      const res = await fetch(`https://api.mangadex.org/chapter?manga=${selectedManga}&offset=${chapterNumber-1}&limit=1&order[chapter]=asc&translatedLanguage[]=en`);
      const data = await res.json();
      const chapter = data.data[0];
      if (chapter) {
        fetchPages(chapter.id);
      } else {
        alert("Chapter not found.");
      }
    }
  };

  return (
    <div className="homePage">
      <h1>Manga Search</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter manga title..."
      />
      <button onClick={searchManga}>Search</button>

      {results.length > 0 && (
        <ul>
          {results.map((manga) => {
            const title = manga.attributes.title.en || "No English Title";
            const id = manga.id;
            return (
              <li key={id}>
                <button
                  onClick={() => {
                    setSelectedManga(id);
                    fetchChapters(id);
                  }}
                >
                  {title}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selectedManga && (
        <div>
          <h2>Selected Manga: {selectedManga}</h2>
          {chapterCount !== null && <p>Total Chapters: {chapterCount}</p>}
        </div>
      )}

      {selectedManga && (
        <div>
          <input
            type="number"
            value={chapterNumber || ""}
            onChange={(e) => setChapterNumber(Number(e.target.value))}
            placeholder="Enter chapter number"
          />
          <button onClick={handleChapterFetch}>Fetch Pages</button>
        </div>
      )}

    </div>
  );
}
