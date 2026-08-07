import { RichObject } from "../../types/explore.types";

export class BookProvider {
    async search(query: string): Promise<RichObject[]> {
        if (!query) return [];
        try {
            const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
            const response = await fetch(url, {
                headers: { "User-Agent": "Vyra-App" }
            });

            if (!response.ok) {
                console.error("[Explore] OpenLibrary fetch error:", response.statusText);
                return [];
            }

            const data = await response.json();
            if (!data.docs || !Array.isArray(data.docs)) return [];

            return data.docs.map((doc: any) => {
                const author = doc.author_name ? doc.author_name.join(", ") : "Unknown Author";
                const firstPublishYear = doc.first_publish_year || "";
                const coverUrl = doc.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` 
                    : "";

                return {
                    id: `openlibrary-${doc.key.replace("/works/", "")}`,
                    type: "BOOK" as const,
                    title: doc.title || "Unknown Book",
                    subtitle: author,
                    image: coverUrl,
                    metadata: {
                        first_publish_year: firstPublishYear,
                        publisher: doc.publisher ? doc.publisher[0] : "",
                        language: doc.language ? doc.language[0] : "",
                        pages: doc.number_of_pages_median || null,
                    },
                    actions: { share: true },
                };
            });
        } catch (err) {
            console.error("[Explore] OpenLibrary search failed:", err);
            return [];
        }
    }
}
