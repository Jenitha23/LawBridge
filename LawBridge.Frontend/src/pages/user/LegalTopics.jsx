import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
    getTopicCategories,
    getTopicsInCategory,
    getTopicDetail,
    searchTopics
} from "../../services/topicsService";
import { useLanguage } from "../../context/LanguageContext";
import { getAssetUrl } from "../../utils/imageUrl";
import "./MyDocuments.css";
import "./LegalTopics.css";


function formatDate(dateString)
{
    const d = new Date(dateString);

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}


function LegalTopics()
{

    const { t, language } = useLanguage();

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

        setLoadingCategories(true);

        // The list the user was looking at may not exist in the newly
        // selected language — drop back to browsing categories fresh
        // rather than showing a stale, wrong-language view.
        setSelectedCategory(null);
        setCategoryDocs([]);
        setSearchResults(null);

        getTopicCategories(language)
            .then(setCategories)
            .catch((err) =>
            {
                setError(
                    err.response?.data?.message ||
                    t("topics_could_not_load")
                );
            })
            .finally(() => setLoadingCategories(false));

    }, [language]);


    const openCategory = async (category) =>
    {

        setSelectedCategory(category);

        setLoadingDocs(true);

        setError("");

        try
        {
            const docs = await getTopicsInCategory(category.id, language);

            setCategoryDocs(docs);
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                t("topics_could_not_load_category")
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
            const results = await searchTopics(q, language);

            setSearchResults(results);
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                t("topics_search_failed")
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
                t("topics_could_not_load_topic")
            );
        }
        finally
        {
            setViewLoading(false);
        }

    };


    return (

        <DashboardLayout title={t("nav_legal_topics")}>

            {() => (

                <>

                    <section className="topics-panel">

                        <form className="topics-search-row" onSubmit={handleSearch}>

                            <input
                                type="text"
                                placeholder={t("topics_search_placeholder")}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />

                            <button type="submit" disabled={searching}>{searching ? t("topics_searching") : t("common_search")}</button>

                            {searchResults && (
                                <button type="button" className="topics-clear-btn" onClick={clearSearch}>{t("topics_clear")}</button>
                            )}

                        </form>


                        {error && <div className="doc-message error">{error}</div>}


                        {searchResults ? (

                            <>

                                <h3>{t("topics_search_results")} {searchResults.length > 0 && `(${searchResults.length})`}</h3>

                                {searchResults.length === 0 ? (

                                    <p className="doc-muted">{t("topics_no_match")} "{query}".</p>

                                ) : (

                                    <div className="topics-doc-list">

                                        {searchResults.map((r) => (

                                            <button className="topics-doc-item" key={r.id} onClick={() => openTopic(r.id)}>
                                                <div>
                                                    <p className="topics-doc-title">
                                                        {r.title}
                                                        {r.isSemanticMatch && (
                                                            <span className="tag tag-orange topics-semantic-tag">
                                                                {t("topics_semantic_match")}
                                                            </span>
                                                        )}
                                                    </p>
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

                                <button className="topics-back-btn" onClick={() => setSelectedCategory(null)}>← {t("topics_all_categories")}</button>

                                <h3>{selectedCategory.name}</h3>

                                {loadingDocs ? (

                                    <p className="doc-muted">{t("common_loading")}</p>

                                ) : categoryDocs.length === 0 ? (

                                    <p className="doc-muted">{t("topics_no_topics_in_category")}</p>

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

                                <h3>{t("topics_browse_category")}</h3>

                                {loadingCategories ? (

                                    <p className="doc-muted">{t("common_loading")}</p>

                                ) : categories.length === 0 ? (

                                    <p className="doc-muted">{t("topics_no_categories")}</p>

                                ) : (

                                    <div className="topics-category-grid">

                                        {categories.map((c) => (

                                            <button className="topics-category-card" key={c.id} onClick={() => openCategory(c)}>
                                                <h4>{c.name}</h4>
                                                <p>{c.description || t("topics_no_description")}</p>
                                                <span className="tag tag-purple">
                                                    {c.documentCount} {c.documentCount === 1 ? t("topics_topic_singular") : t("topics_topic_plural")}
                                                </span>
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
                                    <h3>{viewingTopic?.title || t("common_loading")}</h3>
                                    <button className="doc-modal-close" onClick={() => setViewingTopic(null)}>×</button>
                                </div>

                                {viewLoading && <p className="doc-muted">{t("common_loading")}</p>}

                                {viewingTopic && (

                                    <>

                                        <div className="doc-modal-meta">
                                            <span className="tag tag-purple">{viewingTopic.categoryName}</span>
                                            <span>{viewingTopic.language}</span>
                                            <span>{formatDate(viewingTopic.createdAt)}</span>

                                            {viewingTopic.source && (
                                                <a href={getAssetUrl(viewingTopic.source.replace(/^\//, ""))} target="_blank" rel="noreferrer">
                                                    {t("docs_open_original")}
                                                </a>
                                            )}
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