import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAssetUrl } from "../../utils/imageUrl";
import {
    uploadUserDocument,
    getUserDocuments,
    getUserDocumentById
} from "../../services/userDocumentService";
import "./MyDocuments.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];


function statusClass(status)
{
    if (status === "Completed") return "doc-status-pill doc-status-completed";

    if (status === "Processing") return "doc-status-pill doc-status-processing";

    return "doc-status-pill doc-status-failed";
}


function formatDate(dateString)
{
    const d = new Date(dateString);

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}


function MyDocuments()
{

    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [loadError, setLoadError] = useState("");


    const [file, setFile] = useState(null);

    const [title, setTitle] = useState("");

    const [language, setLanguage] = useState("English");

    const [dragActive, setDragActive] = useState(false);

    const [uploading, setUploading] = useState(false);

    const [formError, setFormError] = useState("");

    const fileInputRef = useRef(null);


    const [viewingDoc, setViewingDoc] = useState(null);

    const [viewLoading, setViewLoading] = useState(false);

    const [viewError, setViewError] = useState("");


    const loadDocuments = async () =>
    {
        try
        {
            const docs = await getUserDocuments();

            setDocuments(docs);

            setLoadError("");
        }
        catch (err)
        {
            setLoadError(
                err.response?.data?.message ||
                "Could not load your documents."
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
        loadDocuments();

    }, []);


    const handleFileChange = (selected) =>
    {
        if (!selected) return;

        const allowed = ["application/pdf", "image/jpeg", "image/png"];

        if (!allowed.includes(selected.type))
        {
            setFormError("Only PDF, JPG, or PNG files are supported.");

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
            setTitle(selected.name.replace(/\.[^/.]+$/, ""));
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

        setLanguage("English");

        if (fileInputRef.current) fileInputRef.current.value = "";
    };


    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        setFormError("");

        if (!file)
        {
            setFormError("Please choose a file to upload.");

            return;
        }

        if (!title.trim())
        {
            setFormError("Title is required.");

            return;
        }

        setUploading(true);

        try
        {
            const result = await uploadUserDocument({ file, title: title.trim(), language });

            resetForm();

            await loadDocuments();

            setViewingDoc(result);
        }
        catch (err)
        {
            setFormError(
                err.response?.data?.message ||
                "Upload failed. Please try again."
            );
        }
        finally
        {
            setUploading(false);
        }
    };


    const openDocument = async (id) =>
    {
        setViewLoading(true);

        setViewError("");

        setViewingDoc(null);

        try
        {
            const detail = await getUserDocumentById(id);

            setViewingDoc(detail);
        }
        catch (err)
        {
            setViewError(
                err.response?.data?.message ||
                "Could not load this document."
            );
        }
        finally
        {
            setViewLoading(false);
        }
    };


    return (

        <DashboardLayout title="My Documents">

            {() => (

                <>

                    <section className="doc-grid">

                        <div className="doc-panel doc-upload-panel">

                            <h3>Upload a Document</h3>
                            <p className="doc-panel-sub">Agreements, notices, contracts, or letters — PDF, JPG, or PNG (max 10MB).</p>

                            <form onSubmit={handleSubmit}>

                                <label
                                    className={`doc-dropzone ${dragActive ? "active" : ""} ${file ? "has-file" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={handleDrop}
                                >

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf,image/jpeg,image/png"
                                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                                        hidden
                                    />

                                    {file ? (
                                        <>
                                            <span className="doc-file-name">{file.name}</span>
                                            <span className="doc-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            <span className="doc-browse-link">Choose a different file</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="doc-drop-text">Drag and drop your file here</span>
                                            <span className="doc-or">or</span>
                                            <span className="doc-browse-btn">Browse File</span>
                                        </>
                                    )}

                                </label>


                                <div className="doc-field">
                                    <label>Title <em>*</em></label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Rental Agreement"
                                    />
                                </div>


                                <div className="doc-field">
                                    <label>Explanation Language <em>*</em></label>
                                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>


                                {formError && <div className="doc-message error">{formError}</div>}

                                <button type="submit" className="doc-submit-btn" disabled={uploading}>
                                    {uploading ? "Processing..." : "Upload & Explain"}
                                </button>

                                {uploading && (
                                    <p className="doc-processing-note">
                                        Extracting text and generating an explanation — this can take a minute on a local model.
                                    </p>
                                )}

                            </form>

                        </div>


                        <div className="doc-panel doc-history-panel">

                            <h3>Document History</h3>

                            {loadError && <div className="doc-message error">{loadError}</div>}

                            {loading ? (

                                <p className="doc-muted">Loading…</p>

                            ) : documents.length === 0 ? (

                                <p className="doc-muted">You haven't uploaded any documents yet.</p>

                            ) : (

                                <div className="doc-list">

                                    {documents.map((d) => (

                                        <button className="doc-list-item" key={d.id} onClick={() => openDocument(d.id)}>

                                            <div>
                                                <p className="doc-list-title">{d.title}</p>
                                                <span className="doc-list-meta">{d.fileName} · {formatDate(d.createdAt)}</span>
                                            </div>

                                            <span className={statusClass(d.status)}>{d.status}</span>

                                        </button>

                                    ))}

                                </div>

                            )}

                        </div>

                    </section>


                    {(viewLoading || viewingDoc || viewError) && (

                        <div className="doc-modal-overlay" onClick={() => { setViewingDoc(null); setViewError(""); }}>

                            <div className="doc-modal" onClick={(e) => e.stopPropagation()}>

                                <div className="doc-modal-header">
                                    <h3>{viewingDoc?.title || "Document"}</h3>
                                    <button className="doc-modal-close" onClick={() => { setViewingDoc(null); setViewError(""); }}>×</button>
                                </div>

                                {viewLoading && <p className="doc-muted">Loading…</p>}

                                {viewError && <div className="doc-message error">{viewError}</div>}

                                {viewingDoc && (

                                    <>

                                        <div className="doc-modal-meta">

                                            <span className={statusClass(viewingDoc.status)}>{viewingDoc.status}</span>
                                            <span>{viewingDoc.language}</span>
                                            <span>{formatDate(viewingDoc.createdAt)}</span>

                                            {viewingDoc.filePath && (
                                                <a href={getAssetUrl(viewingDoc.filePath.replace(/^\//, ""))} target="_blank" rel="noreferrer">
                                                    Open original file
                                                </a>
                                            )}

                                        </div>


                                        {viewingDoc.status === "Failed" && (
                                            <div className="doc-message error">
                                                {viewingDoc.errorMessage || "This document could not be processed."}
                                            </div>
                                        )}

                                        {viewingDoc.status === "Processing" && (
                                            <p className="doc-muted">Still processing — check back in a moment.</p>
                                        )}

                                        {viewingDoc.status === "Completed" && (

                                            <>

                                                <h4>AI Explanation</h4>
                                                <p className="doc-explanation">{viewingDoc.explanation}</p>

                                                {viewingDoc.extractedText && (

                                                    <details className="doc-extracted-text">
                                                        <summary>View extracted text</summary>
                                                        <p>{viewingDoc.extractedText}</p>
                                                    </details>

                                                )}

                                            </>

                                        )}

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


export default MyDocuments;
