import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import { getAssetUrl } from "../../utils/imageUrl";
import {
    getDocuments,
    getDocumentById,
    updateDocument,
    getCategories,
    deleteDocument
} from "../../services/documentService";
import "./UploadDocument.css";
import "./LegalDocuments.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];

const PAGE_SIZE = 10;


function statusClass(status)
{
    if (status === "Processed") return "status-pill status-processed";

    if (status === "Processing") return "status-pill status-processing";

    return "status-pill status-failed";
}


function formatDate(dateString)
{
    const d = new Date(dateString);

    const datePart = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    const timePart = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    return `${datePart} · ${timePart}`;
}


function LegalDocuments()
{

    const [documents, setDocuments] = useState([]);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [loadError, setLoadError] = useState("");


    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] = useState("");

    const [page, setPage] = useState(1);

    const [deletingId, setDeletingId] = useState(null);


    const [manageDoc, setManageDoc] = useState(null);

    const [manageLoading, setManageLoading] = useState(false);

    const [manageError, setManageError] = useState("");

    const [manageSaving, setManageSaving] = useState(false);

    const [editForm, setEditForm] = useState({ title: "", categoryId: "", language: "English" });


    const loadData = async () =>
    {
        try
        {
            const [docs, cats] = await Promise.all([getDocuments(), getCategories()]);

            setDocuments(docs);

            setCategories(cats);

            setLoadError("");
        }
        catch (err)
        {
            setLoadError(
                err.response?.data?.message ||
                "Could not load legal documents."
            );
        }
        finally
        {
            setLoading(false);
        }
    };


    useEffect(() =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
        loadData();

    }, []);


    const openManage = async (id) =>
    {
        setManageLoading(true);

        setManageError("");

        setManageDoc(null);

        try
        {
            const detail = await getDocumentById(id);

            setManageDoc(detail);

            setEditForm({ title: detail.title, categoryId: detail.categoryId, language: detail.language });
        }
        catch (err)
        {
            setManageError(
                err.response?.data?.message ||
                "Could not load document details."
            );
        }
        finally
        {
            setManageLoading(false);
        }
    };


    const closeManage = () =>
    {
        setManageDoc(null);

        setManageError("");
    };


    const handleSaveEdit = async () =>
    {
        if (!editForm.title.trim() || !editForm.categoryId) return;

        setManageSaving(true);

        setManageError("");

        try
        {
            await updateDocument(manageDoc.id, {
                title: editForm.title.trim(),
                categoryId: editForm.categoryId,
                language: editForm.language
            });

            closeManage();

            await loadData();
        }
        catch (err)
        {
            setManageError(
                err.response?.data?.message ||
                "Could not save changes."
            );
        }
        finally
        {
            setManageSaving(false);
        }
    };


    const handleDelete = async (id) =>
    {
        if (!window.confirm("Delete this document and its indexed content? This can't be undone.")) return;

        setDeletingId(id);

        try
        {
            await deleteDocument(id);

            setDocuments((prev) => prev.filter((d) => d.id !== id));
        }
        catch (err)
        {
            setLoadError(
                err.response?.data?.message ||
                "Could not delete document."
            );
        }
        finally
        {
            setDeletingId(null);
        }
    };


    const filteredDocuments = documents.filter((d) =>
        (d.title.toLowerCase().includes(search.toLowerCase()) ||
            d.fileName.toLowerCase().includes(search.toLowerCase())) &&
        (!categoryFilter || d.categoryName === categoryFilter)
    );

    const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE));

    const pageDocuments = filteredDocuments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);


    return (

        <AdminDashboardLayout title="Legal Documents">

            {() => (

                <>

                    <section className="admin-panel legal-docs-panel">

                        <div className="admin-panel-header upload-list-header">

                            <h3>All Legal Documents</h3>

                            <div className="legal-docs-filters">

                                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                                    <option value="">All Categories</option>
                                    {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>

                                <div className="upload-search">
                                    <SearchIcon />
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    />
                                </div>

                            </div>

                        </div>


                        {loadError && <div className="upload-page-error">{loadError}</div>}


                        {loading ? (

                            <p className="admin-panel-muted">Loading documents…</p>

                        ) : pageDocuments.length === 0 ? (

                            <p className="admin-panel-muted">No documents found.</p>

                        ) : (

                            <>

                                <div className="upload-table-wrap">

                                    <table className="upload-table">

                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Language</th>
                                                <th>Uploaded On</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {pageDocuments.map((d) => (

                                                <tr key={d.id}>

                                                    <td>
                                                        <div className="upload-doc-cell">
                                                            <div>
                                                                <div className="upload-doc-title">{d.title}</div>
                                                                <div className="upload-doc-file">{d.fileName}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td><span className="tag tag-purple">{d.categoryName}</span></td>

                                                    <td>{d.language}</td>

                                                    <td>{formatDate(d.createdAt)}</td>

                                                    <td><span className={statusClass(d.status)}>{d.status}</span></td>

                                                    <td>

                                                        <div className="upload-actions">

                                                            <button className="upload-icon-btn" title="View / edit details" onClick={() => openManage(d.id)}>
                                                                <EditIcon />
                                                            </button>

                                                            <a
                                                                href={getAssetUrl(d.source.replace(/^\//, ""))}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="upload-icon-btn"
                                                                title="Open PDF"
                                                            >
                                                                <ViewIcon />
                                                            </a>

                                                            <button
                                                                className="upload-icon-btn danger"
                                                                title="Delete document"
                                                                onClick={() => handleDelete(d.id)}
                                                                disabled={deletingId === d.id}
                                                            >
                                                                <TrashIcon />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>


                                <div className="upload-pagination">

                                    <span className="upload-pagination-info">
                                        Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredDocuments.length)} of {filteredDocuments.length} documents
                                    </span>

                                    <div className="upload-pagination-controls">

                                        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button key={p} className={p === page ? "active" : ""} onClick={() => setPage(p)}>{p}</button>
                                        ))}

                                        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>

                                    </div>

                                </div>

                            </>

                        )}

                    </section>


                    {(manageLoading || manageDoc) && (

                        <div className="upload-modal-overlay" onClick={closeManage}>

                            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>

                                <div className="upload-modal-header">
                                    <h3>Document Details</h3>
                                    <button className="upload-modal-close" onClick={closeManage}>×</button>
                                </div>

                                {manageLoading && <p className="admin-panel-muted">Loading…</p>}

                                {!manageLoading && manageDoc && (

                                    <>

                                        <dl className="upload-modal-facts">

                                            <div>
                                                <dt>File</dt>
                                                <dd>{manageDoc.fileName}</dd>
                                            </div>

                                            <div>
                                                <dt>Uploaded</dt>
                                                <dd>{formatDate(manageDoc.createdAt)}</dd>
                                            </div>

                                            <div>
                                                <dt>Chunks</dt>
                                                <dd>{manageDoc.embeddedChunkCount} / {manageDoc.chunkCount} embedded</dd>
                                            </div>

                                            <div>
                                                <dt>Status</dt>
                                                <dd><span className={statusClass(manageDoc.status)}>{manageDoc.status}</span></dd>
                                            </div>

                                        </dl>


                                        <div className="upload-field">
                                            <label>Title <em>*</em></label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                                            />
                                        </div>

                                        <div className="upload-field">
                                            <label>Category <em>*</em></label>
                                            <select
                                                value={editForm.categoryId}
                                                onChange={(e) => setEditForm((f) => ({ ...f, categoryId: e.target.value }))}
                                            >
                                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="upload-field">
                                            <label>Language <em>*</em></label>
                                            <select
                                                value={editForm.language}
                                                onChange={(e) => setEditForm((f) => ({ ...f, language: e.target.value }))}
                                            >
                                                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>

                                        {manageError && <div className="upload-form-message error">{manageError}</div>}

                                        <div className="upload-modal-actions">
                                            <button className="upload-modal-cancel" onClick={closeManage}>Cancel</button>
                                            <button className="upload-submit-btn" onClick={handleSaveEdit} disabled={manageSaving}>
                                                {manageSaving ? "Saving..." : "Save Changes"}
                                            </button>
                                        </div>

                                    </>

                                )}

                            </div>

                        </div>

                    )}

                </>

            )}

        </AdminDashboardLayout>

    );

}


function SearchIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }

function ViewIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" /></svg>); }

function EditIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15.2 4.5l4.3 4.3-10 10-4.7.4.4-4.7 10-10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>); }

function TrashIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M18 7l-.8 12a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>); }


export default LegalDocuments;
