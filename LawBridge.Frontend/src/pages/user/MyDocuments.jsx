import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAssetUrl } from "../../utils/imageUrl";
import {
    uploadUserDocument,
    getUserDocuments,
    getUserDocumentById
} from "../../services/userDocumentService";
import { useLanguage } from "../../context/LanguageContext";
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

    const { t } = useLanguage();

    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [loadError, setLoadError] = useState("");


    const [file, setFile] = useState(null);

    const [title, setTitle] = useState("");

    const [docLanguage, setDocLanguage] = useState("English");

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
                t("docs_could_not_load")
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
            setFormError(t("docs_only_pdf_jpg_png"));

            return;
        }

        if (selected.size > 10 * 1024 * 1024)
        {
            setFormError(t("docs_file_too_large"));

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

        setDocLanguage("English");

        if (fileInputRef.current) fileInputRef.current.value = "";
    };


    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        setFormError("");

        if (!file)
        {
            setFormError(t("docs_choose_file_required"));

            return;
        }

        if (!title.trim())
        {
            setFormError(t("docs_title_required"));

            return;
        }

        setUploading(true);

        try
        {
            const result = await uploadUserDocument({ file, title: title.trim(), language: docLanguage });

            resetForm();

            await loadDocuments();

            setViewingDoc(result);
        }
        catch (err)
        {
            setFormError(
                err.response?.data?.message ||
                t("docs_upload_failed")
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
                t("docs_could_not_load_doc")
            );
        }
        finally
        {
            setViewLoading(false);
        }
    };


    return (

        <DashboardLayout title={t("nav_my_documents")}>

            {() => (

                <>

                    <section className="doc-grid">

                        <div className="doc-panel doc-upload-panel">

                            <h3>{t("docs_upload_heading")}</h3>
                            <p className="doc-panel-sub">{t("docs_upload_sub")}</p>

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
                                            <span className="doc-browse-link">{t("docs_choose_different")}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="doc-drop-text">{t("docs_drop_text")}</span>
                                            <span className="doc-or">{t("docs_or")}</span>
                                            <span className="doc-browse-btn">{t("docs_browse_btn")}</span>
                                        </>
                                    )}

                                </label>


                                <div className="doc-field">
                                    <label>{t("docs_title_label")} <em>*</em></label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={t("docs_title_placeholder")}
                                    />
                                </div>


                                <div className="doc-field">
                                    <label>{t("docs_language_label")} <em>*</em></label>
                                    <select value={docLanguage} onChange={(e) => setDocLanguage(e.target.value)}>
                                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>


                                {formError && <div className="doc-message error">{formError}</div>}

                                <button type="submit" className="doc-submit-btn" disabled={uploading}>
                                    {uploading ? t("docs_processing_btn") : t("docs_submit_btn")}
                                </button>

                                {uploading && (
                                    <p className="doc-processing-note">
                                        {t("docs_processing_note")}
                                    </p>
                                )}

                            </form>

                        </div>


                        <div className="doc-panel doc-history-panel">

                            <h3>{t("docs_history_heading")}</h3>

                            {loadError && <div className="doc-message error">{loadError}</div>}

                            {loading ? (

                                <p className="doc-muted">{t("common_loading")}</p>

                            ) : documents.length === 0 ? (

                                <p className="doc-muted">{t("docs_no_documents")}</p>

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
                                    <h3>{viewingDoc?.title || t("docs_modal_default_title")}</h3>
                                    <button className="doc-modal-close" onClick={() => { setViewingDoc(null); setViewError(""); }}>×</button>
                                </div>

                                {viewLoading && <p className="doc-muted">{t("common_loading")}</p>}

                                {viewError && <div className="doc-message error">{viewError}</div>}

                                {viewingDoc && (

                                    <>

                                        <div className="doc-modal-meta">

                                            <span className={statusClass(viewingDoc.status)}>{viewingDoc.status}</span>
                                            <span>{viewingDoc.language}</span>
                                            <span>{formatDate(viewingDoc.createdAt)}</span>

                                            {viewingDoc.filePath && (
                                                <a href={getAssetUrl(viewingDoc.filePath.replace(/^\//, ""))} target="_blank" rel="noreferrer">
                                                    {t("docs_open_original")}
                                                </a>
                                            )}

                                        </div>


                                        {viewingDoc.status === "Failed" && (
                                            <div className="doc-message error">
                                                {viewingDoc.errorMessage || t("docs_could_not_process")}
                                            </div>
                                        )}

                                        {viewingDoc.status === "Processing" && (
                                            <p className="doc-muted">{t("docs_still_processing")}</p>
                                        )}

                                        {viewingDoc.status === "Completed" && (

                                            <>

                                                <h4>{t("docs_ai_explanation")}</h4>
                                                <p className="doc-explanation">{viewingDoc.explanation}</p>

                                                {viewingDoc.extractedText && (

                                                    <details className="doc-extracted-text">
                                                        <summary>{t("docs_view_extracted_text")}</summary>
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
