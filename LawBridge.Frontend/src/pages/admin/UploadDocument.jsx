import { useEffect, useRef, useState } from "react";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import { getAssetUrl } from "../../utils/imageUrl";
import {
    getDocuments,
    getCategories,
    uploadDocument,
    deleteDocument
} from "../../services/documentService";
import "./UploadDocument.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];

const PAGE_SIZE = 5;


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


function UploadDocument()
{

    const [documents, setDocuments] = useState([]);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [loadError, setLoadError] = useState("");


    const [file, setFile] = useState(null);

    const [title, setTitle] = useState("");

    const [categoryId, setCategoryId] = useState("");

    const [language, setLanguage] = useState("English");

    const [dragActive, setDragActive] = useState(false);

    const [uploading, setUploading] = useState(false);

    const [uploadProgress, setUploadProgress] = useState(0);

    const [formError, setFormError] = useState("");

    const [formSuccess, setFormSuccess] = useState("");

    const fileInputRef = useRef(null);


    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const [deletingId, setDeletingId] = useState(null);


    const loadData = async () =>
    {
        try
        {
            const [docs, cats] = await Promise.all([
                getDocuments(),
                getCategories()
            ]);

            setDocuments(docs);

            setCategories(cats);

            setLoadError("");
        }
        catch (err)
        {
            setLoadError(
                err.response?.data?.message ||
                "Could not load documents. Please try again."
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


    const handleFileChange = (selected) =>
    {
        if (!selected) return;

        if (selected.type !== "application/pdf")
        {
            setFormError("Only PDF files are supported.");

            return;
        }

        if (selected.size > 10 * 1024 * 1024)
        {
            setFormError("File is too large — max size is 10MB.");

            return;
        }

        setFormError("");

        setFile(selected);

        if (!title)
        {
            setTitle(selected.name.replace(/\.pdf$/i, ""));
        }
    };


    const handleDrop = (e) =>
    {
        e.preventDefault();

        setDragActive(false);

        handleFileChange(e.dataTransfer.files?.[0]);
    };


    const resetForm = () =>
    {
        setFile(null);

        setTitle("");

        setCategoryId("");

        setLanguage("English");

        setUploadProgress(0);

        if (fileInputRef.current) fileInputRef.current.value = "";
    };


    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        setFormError("");

        setFormSuccess("");

        if (!file)
        {
            setFormError("Please choose a PDF file to upload.");

            return;
        }

        if (!title.trim())
        {
            setFormError("Title is required.");

            return;
        }

        if (!categoryId)
        {
            setFormError("Please select a category.");

            return;
        }

        setUploading(true);

        try
        {
            await uploadDocument(
                { file, title: title.trim(), categoryId, language },
                (progressEvent) =>
                {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || 1)
                    );

                    setUploadProgress(percent);
                }
            );

            setFormSuccess("Document uploaded and processed successfully.");

            resetForm();

            await loadData();
        }
        catch (err)
        {
            setFormError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Upload failed. Please try again."
            );
        }
        finally
        {
            setUploading(false);
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
                "Could not delete document. Please try again."
            );
        }
        finally
        {
            setDeletingId(null);
        }
    };


    const filteredDocuments = documents.filter((d) =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.fileName.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE));

    const pageDocuments = filteredDocuments.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const stats = {
        total: documents.length,
        processed: documents.filter((d) => d.status === "Processed").length,
        processing: documents.filter((d) => d.status === "Processing").length,
        failed: documents.filter((d) => d.status === "Failed").length
    };


    return (

        <AdminDashboardLayout title="Upload Legal Document">

            {() => (

                <>

                    <section className="upload-info-banner">

                        <InfoIcon />

                        <div>
                            <p className="upload-info-title">Upload legal documents to expand the AI knowledge base.</p>
                            <p className="upload-info-sub">Supported formats: PDF files only (Max size: 10MB)</p>
                        </div>

                        <div className="upload-info-art">
                            <CloudIcon />
                            <DocArtIcon />
                        </div>

                    </section>


                    {loadError && (
                        <div className="upload-page-error">{loadError}</div>
                    )}


                    <section className="upload-grid">

                        <div className="admin-panel upload-form-panel">

                            <div className="admin-panel-header">
                                <h3><UploadIcon /> Upload New Document</h3>
                            </div>

                            <form onSubmit={handleSubmit}>

                                <label
                                    className={`upload-dropzone ${dragActive ? "active" : ""} ${file ? "has-file" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={handleDrop}
                                >

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                                        hidden
                                    />

                                    {file ? (

                                        <>
                                            <PdfBadgeIcon />
                                            <span className="upload-file-name">{file.name}</span>
                                            <span className="upload-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            <span className="upload-browse-link">Choose a different file</span>
                                        </>

                                    ) : (

                                        <>
                                            <CloudUploadIcon />
                                            <span className="upload-drop-text">Drag and drop your PDF file here</span>
                                            <span className="upload-or">or</span>
                                            <span className="upload-browse-btn"><FolderIcon /> Browse PDF File</span>
                                        </>

                                    )}

                                </label>


                                <div className="upload-field">
                                    <label>Title <em>*</em></label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter document title"
                                    />
                                </div>


                                <div className="upload-field">
                                    <label>Category <em>*</em></label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                    >
                                        <option value="">Select a category</option>

                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}

                                    </select>
                                </div>


                                <div className="upload-field">
                                    <label>Language <em>*</em></label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    >
                                        {LANGUAGES.map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>


                                {formError && <div className="upload-form-message error">{formError}</div>}

                                {formSuccess && <div className="upload-form-message success">{formSuccess}</div>}

                                {uploading && (

                                    <div className="upload-progress">
                                        <div className="upload-progress-bar">
                                            <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                        <span>{uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : "Generating embeddings…"}</span>
                                    </div>

                                )}


                                <button type="submit" className="upload-submit-btn" disabled={uploading}>
                                    <UploadIcon /> {uploading ? "Uploading..." : "Upload Document"}
                                </button>

                            </form>

                        </div>


                        <div className="admin-panel upload-list-panel">

                            <div className="admin-panel-header upload-list-header">
                                <h3><DocsIcon /> Uploaded Documents</h3>

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
                                                                <PdfBadgeIcon />
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

                                                                <a
                                                                    href={getAssetUrl(d.source.replace(/^\//, ""))}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="upload-icon-btn"
                                                                    title="View document"
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
                                                <button
                                                    key={p}
                                                    className={p === page ? "active" : ""}
                                                    onClick={() => setPage(p)}
                                                >
                                                    {p}
                                                </button>
                                            ))}

                                            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>

                                        </div>

                                    </div>

                                </>

                            )}

                        </div>

                    </section>


                    <section className="upload-stats-grid">

                        <div className="admin-stat-card">
                            <div className="admin-stat-icon icon-purple"><DocIcon /></div>
                            <div className="admin-stat-value">{stats.total}</div>
                            <div className="admin-stat-label">Total Documents</div>
                            <div className="admin-stat-sub">All uploaded documents</div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="admin-stat-icon icon-green"><CheckIcon /></div>
                            <div className="admin-stat-value">{stats.processed}</div>
                            <div className="admin-stat-label">Processed Documents</div>
                            <div className="admin-stat-sub">Successfully processed</div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="admin-stat-icon icon-orange"><ClockIcon /></div>
                            <div className="admin-stat-value">{stats.processing}</div>
                            <div className="admin-stat-label">Processing</div>
                            <div className="admin-stat-sub">Currently processing</div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="admin-stat-icon icon-red"><FailIcon /></div>
                            <div className="admin-stat-value">{stats.failed}</div>
                            <div className="admin-stat-label">Failed</div>
                            <div className="admin-stat-sub">Processing failed</div>
                        </div>

                    </section>

                </>

            )}

        </AdminDashboardLayout>

    );

}


// ================= Icons (plain inline SVG, no external deps) =================

function InfoIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--primary)" strokeWidth="1.7" /><path d="M12 11v5.5M12 8v.01" stroke="var(--primary)" strokeWidth="1.7" strokeLinecap="round" /></svg>); }

function CloudIcon() { return (<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M7 18a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.2 8.1 4.5 4.5 0 0 1 17.5 18H7Z" stroke="var(--primary-light)" strokeWidth="1.5" /><path d="M12 10.5V16M12 10.5l-2 2M12 10.5l2 2" stroke="var(--primary-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>); }

function DocArtIcon() { return (<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="var(--primary-light)" strokeWidth="1.5" strokeLinejoin="round" /></svg>); }

function UploadIcon() { return (<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 16V6M12 6l-3.5 3.5M12 6l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>); }

function CloudUploadIcon() { return (<svg width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M7 18a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.2 8.1 4.5 4.5 0 0 1 17.5 18H7Z" stroke="var(--primary)" strokeWidth="1.6" /><path d="M12 10v6.5M12 10l-2.3 2.3M12 10l2.3 2.3" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>); }

function FolderIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10l2 2.5h5.5A2.5 2.5 0 0 1 20 9v8.5A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>); }

function PdfBadgeIcon() { return (<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.3" strokeLinejoin="round" /></svg>); }

function DocsIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="var(--primary)" strokeWidth="1.7" strokeLinejoin="round" /></svg>); }

function SearchIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }

function ViewIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" /></svg>); }

function TrashIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M18 7l-.8 12a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>); }

function DocIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 12h6M9 15.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }

function CheckIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>); }

function ClockIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>); }

function FailIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" /><path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }


export default UploadDocument;
