import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
    getTopicCategories,
    getTopicsInCategory,
    getTopicDetail,
    searchTopics
} from "../../services/topicsService";
import "./MyDocuments.css";
import "./LegalTopics.css";


function formatDate(dateString)
{
    const d = new Date(dateString);

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}


function LegalTopics()
{

    const [categories, setCategories] = useState([]);

    const [loadingCategories, setLoadingCategories] = useState(true);

    const [error, setError] = useState("");


    const [selectedCategory, setSelectedCategory] = useState(null);

    const [categoryDocs, setCategoryDocs] = useState([]);

    const [loadingDocs, setLoadingDocs] = useState(false);


    const [query, setQuery] = useState("");

    const [searchResults, setSearchResults] = useState(null);

    const [searching, setSearching] = useState(false);


    const [viewingTopic, setViewingTopic] = useState(null);

    const [viewLoading, setViewLoading] = useState(false);


    useEffect(() =>
    {

        getTopicCategories()
            .then(setCategories)
            .catch((err) =>
            {
                setError(
                    err.response?.data?.message ||
                    "Could not load legal topics."
                );
            })
            .finally(() => setLoadingCategories(false));

    }, []);


    const openCategory = async (category) =>
    {

        setSelectedCategory(category);

        setLoadingDocs(true);

        setError("");

        try
        {
            const docs = await getTopicsInCategory(category.id);

            setCategoryDocs(docs);
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                "Could not load topics in this category."
            );
        }
        finally
        {
            setLoadingDocs(false);
        }

    };


    const handleSearch = async (e) =>
    {

        e.preventDefault();

        const q = query.trim();

        if (!q)
        {
            setSearchResults(null);

            return;
        }

        setSearching(true);

        setError("");

        try
        {
            const results = await searchTopics(q);

            setSearchResults(results);
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                "Search failed. Please try again."
            );
        }
        finally
        {
            setSearching(false);
        }

    };


    const clearSearch = () =>
    {
        setQuery("");

        setSearchResults(null);
    };


    const openTopic = async (id) =>
    {

        setViewLoading(true);

        setViewingTopic(null);

        try
        {
            const detail = await getTopicDetail(id);

            setViewingTopic(detail);
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                "Could not load this topic."
            );
        }
        finally
        {
            setViewLoading(false);
        }

    };


    return (

        <DashboardLayout title="Legal Topics">

            {() => (

                <>

                    <section className="topics-panel">

                        <form className="topics-search-row" onSubmit={handleSearch}>

                            <input
                                type="text"
                                placeholder="Search legal topics (e.g. 'deposit', 'termination', 'refund')"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />

                            <button type="submit" disabled={searching}>{searching ? "Searching..." : "Search"}</button>

                            {searchResults && (
                                <button type="button" className="topics-clear-btn" onClick={clearSearch}>Clear</button>
                            )}

                        </form>


                        {error && <div className="doc-message error">{error}</div>}


                        {searchResults ? (

                            <>

                                <h3>Search Results {searchResults.length > 0 && `(${searchResults.length})`}</h3>

                                {searchResults.length === 0 ? (

                                    <p className="doc-muted">No topics matched "{query}".</p>

                                ) : (

                                    <div className="topics-doc-list">

                                        {searchResults.map((r) => (

                                            <button className="topics-doc-item" key={r.id} onClick={() => openTopic(r.id)}>
                                                <div>
                                                    <p className="topics-doc-title">{r.title}</p>
                                                    <p className="topics-snippet">{r.snippet}</p>
                                                </div>
                                                <span className="tag tag-purple">{r.categoryName}</span>
                                            </button>

                                        ))}

                                    </div>

                                )}

                            </>

                        ) : selectedCategory ? (

                            <>

                                <button className="topics-back-btn" onClick={() => setSelectedCategory(null)}>← All Categories</button>

                                <h3>{selectedCategory.name}</h3>

                                {loadingDocs ? (

                                    <p className="doc-muted">Loading…</p>

                                ) : categoryDocs.length === 0 ? (

                                    <p className="doc-muted">No topics in this category yet.</p>

                                ) : (

                                    <div className="topics-doc-list">

                                        {categoryDocs.map((d) => (

                                            <button className="topics-doc-item" key={d.id} onClick={() => openTopic(d.id)}>
                                                <div>
                                                    <p className="topics-doc-title">{d.title}</p>
                                                    <span className="topics-doc-meta">{d.language} · {formatDate(d.createdAt)}</span>
                                                </div>
                                            </button>

                                        ))}

                                    </div>

                                )}

                            </>

                        ) : (

                            <>

                                <h3>Browse by Category</h3>

                                {loadingCategories ? (

                                    <p className="doc-muted">Loading…</p>

                                ) : categories.length === 0 ? (

                                    <p className="doc-muted">No legal categories available yet.</p>

                                ) : (

                                    <div className="topics-category-grid">

                                        {categories.map((c) => (

                                            <button className="topics-category-card" key={c.id} onClick={() => openCategory(c)}>
                                                <h4>{c.name}</h4>
                                                <p>{c.description || "No description."}</p>
                                                <span className="tag tag-purple">{c.documentCount} topic{c.documentCount === 1 ? "" : "s"}</span>
                                            </button>

                                        ))}

                                    </div>

                                )}

                            </>

                        )}

                    </section>


                    {(viewLoading || viewingTopic) && (

                        <div className="doc-modal-overlay" onClick={() => setViewingTopic(null)}>

                            <div className="doc-modal" onClick={(e) => e.stopPropagation()}>

                                <div className="doc-modal-header">
                                    <h3>{viewingTopic?.title || "Loading…"}</h3>
                                    <button className="doc-modal-close" onClick={() => setViewingTopic(null)}>×</button>
                                </div>

                                {viewLoading && <p className="doc-muted">Loading…</p>}

                                {viewingTopic && (

                                    <>

                                        <div className="doc-modal-meta">
                                            <span className="tag tag-purple">{viewingTopic.categoryName}</span>
                                            <span>{viewingTopic.language}</span>
                                            <span>{formatDate(viewingTopic.createdAt)}</span>
                                        </div>

                                        <p className="doc-explanation">{viewingTopic.content}</p>

                                    </>

                                )}

                            </div>

                        </div>

                    )}

                </>

            )}

        </DashboardLayout>

    );

}


export default LegalTopics;
