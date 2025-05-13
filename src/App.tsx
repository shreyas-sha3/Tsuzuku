
if ('__TAURI__' in window) {
  const { fetch } = await import('@tauri-apps/plugin-http');
  fetch
}

import { useState, useEffect, useRef } from "react";
import "./styles.css"; 

export function App() {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const [selectedManga, setSelectedManga] = useState<string>("");
  const [selectedMangaTitle, setSelectedMangaTitle] = useState<string>("");
  const [chapterCount, setChapterCount] = useState<number | null>(null);
  const [chapterNumber, setChapterNumber] = useState<number | null>(1);


  //check if
  const [mangaSelected, setMangaSelected] = useState<boolean>(false);
  const [chapterSelected, setChapterSelected] = useState<boolean>(false);

  const searchManga = async () => {
    const res = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=5&order[relevance]=desc&originalLanguage[]=ja`);
    const data = await res.json();
    setResults(data.data);
  };

  const fetchChapters = async (mangaId: string) => {
    let totalChapters = 0;
    let offset = 0;
    while (true) {
      const res = await fetch(`https://api.mangadex.org/chapter?manga=${mangaId}&limit=100&offset=${offset}&translatedLanguage[]=en&order[chapter]=asc`);
      const data = await res.json();
      totalChapters += data.data.length;
      if (data.data.length < 100) break;
      offset += 100;
    }
    setChapterCount(totalChapters);
  };

  const fetchPages = async (chapterId: string) => {
    setCurrentPage(0);
    setShowSearch(false);
  
    const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
    const data = await res.json();
  
    const hash: string = data.chapter.hash;
    const baseUrl: string = data.baseUrl;
    const imageFilenames: string[] = data.chapter.data;
  
    const urls: string[] = imageFilenames.map(
      (page: string) => `${baseUrl}/data/${hash}/${page}`
    );
  
    let loadedCount = 0;
    const loadThreshold = 3;
    let alreadySet = false;
  
    urls.forEach((url: string) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= loadThreshold && !alreadySet) {
          alreadySet = true;
          setPages(urls);
        }
      };
      img.src = url;
    });
  }; 

  const handleChapterFetch = async () => {
    if (chapterNumber !== null) {
      const res = await fetch(`https://api.mangadex.org/chapter?manga=${selectedManga}&offset=${chapterNumber - 1}&limit=1&order[chapter]=asc&translatedLanguage[]=en`);
      const data = await res.json();
      const chapter = data.data[0];
      if (chapter) {
        fetchPages(chapter.id);
        setChapterSelected(true); // Mark chapter selection as done
      } else {
        alert("Chapter not found.");
      }
    }
  };
  
  // const nextPage = () => {
  //   if (currentPage < pages.length - 1) {
  //     setCurrentPage(currentPage + 1);
  //   }
  // };

  // const prevPage = () => {
  //   if (currentPage > 0) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (results.length > 1) {
      setHighlightedIndex(0);
    } 
  }, [results]);
  
  // Handle key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault(); // <- prevents '/' from being typed
        setShowSearch(prev => !prev);
        setMangaSelected(false);
        setChapterSelected(false);
        setSelectedManga("");
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "l") {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "h" ) {
        setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pages]);
  
  return (
    <div className="container">

      {showSearch && (
      <div className="searchManga">
        {!mangaSelected && !selectedManga && (  // Conditionally render the search section
          <>
            <h1>Tsuzuku</h1>
            <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightedIndex(-1); // reset when typing
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < results.length) {
                  const selected = results[highlightedIndex];
                  const title = selected.attributes.title.en || "No English Title";
                  setSelectedManga(selected.id);
                  setSelectedMangaTitle(title);
                  fetchChapters(selected.id);
                  setMangaSelected(true);
                } else {
                  searchManga();
                }
              }
            }}
            placeholder="Enter manga title..."
          />
            {results.length > 0 && (
              <ul>
  {results.map((manga, index) => {
    const title = manga.attributes.title.en || "No English Title";
    const id = manga.id;
    return (
      <li key={id}>
        <button
          style={{
            color: index === highlightedIndex ? "#eee" : "#888"
          }}
          onClick={() => {
            setSelectedManga(id);
            setSelectedMangaTitle(title);
            fetchChapters(id);
            setMangaSelected(true);
          }}
        >
        {title}
        </button>
      </li>
    );
  })}
</ul>
            )}
          </>
        )}

        {!chapterSelected && selectedManga && (
          <div>
            <h2>{selectedMangaTitle}</h2>
            {chapterCount !== null && <p>Select Chapter: 1 - {chapterCount}</p>}
            <input
              autoFocus
              type="number"
              min="1" 
              value={chapterNumber || ""}
              onChange={(e) => setChapterNumber(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleChapterFetch();
                }
              }}
            />
            <button onClick={handleChapterFetch}></button>
          </div>
        )}
      </div>
    )}

<div className="Title">
  <span className="title">{selectedMangaTitle}</span>
  <div className="pgno">
    <div className="chapter">Chapter {chapterNumber}</div>
    <div>Page {currentPage + 1}</div>
  </div>
</div>

      <div className="image-box">
        {pages.length > 0 && (
          <img
            src={pages[currentPage]}
            alt={`Manga page ${currentPage + 1}`}
          />
        )}
      </div>

      {/* <div className="buttons">
        <button onClick={nextPage} disabled={currentPage === 0}>← Next</button>
        <button onClick={prevPage} disabled={currentPage === pages.length - 1}>Previous →</button>
      </div>  */}
    </div>
  );
}
