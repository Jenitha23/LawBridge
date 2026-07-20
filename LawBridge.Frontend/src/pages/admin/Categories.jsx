import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/documentService";
import "./UploadDocument.css";
import "./Categories.css";


function Categories()
{

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const [modalOpen, setModalOpen] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({ name: "", description: "" });

    const [formError, setFormError] = useState("");

    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);


    const loadCategories = async () =>
    {
        try
        {
            const data = await getCategories();

            setCategories(data);

            setError("");
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                "Could not load categories."
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
        loadCategories();

    }, []);


    const openCreate = () =>
    {
        setEditingId(null);

        setForm({ name: "", description: "" });

        setFormError("");

        setModalOpen(true);
    };


    const openEdit = (category) =>
    {
        setEditingId(category.id);

        setForm({ name: category.name, description: category.description });

        setFormError("");

        setModalOpen(true);
    };


    const closeModal = () =>
    {
        setModalOpen(false);
    };


    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        if (!form.name.trim())
        {
            setFormError("Category name is required.");

            return;
        }

        setSaving(true);

        setFormError("");

        try
        {
            if (editingId)
            {
                await updateCategory(editingId, form);
            }
            else
            {
                await createCategory(form);
            }

            setModalOpen(false);

            await loadCategories();
        }
        catch (err)
        {
            setFormError(
                err.response?.data?.message ||
                "Could not save category."
            );
        }
        finally
        {
            setSaving(false);
        }
    };


    const handleDelete = async (category) =>
    {
        if (!window.confirm(`Delete the "${category.name}" category?`)) return;

        setDeletingId(category.id);

        try
        {
            await deleteCategory(category.id);

            setCategories((prev) => prev.filter((c) => c.id !== category.id));
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                "Could not delete category."
            );
        }
        finally
        {
            setDeletingId(null);
        }
    };


    return (

        <AdminDashboardLayout title="Legal Categories">

            {() => (

                <>

                    <section className="admin-panel categories-panel">

                        <div className="admin-panel-header">
                            <h3>Legal Categories</h3>
                            <button className="categories-add-btn" onClick={openCreate}>
                                <PlusIcon /> Add Category
                            </button>
                        </div>


                        {error && <div className="upload-page-error">{error}</div>}


                        {loading ? (

                            <p className="admin-panel-muted">Loading categories…</p>

                        ) : categories.length === 0 ? (

                            <p className="admin-panel-muted">No categories yet — add one to get started.</p>

                        ) : (

                            <div className="categories-grid">

                                {categories.map((c) => (

                                    <div className="category-card" key={c.id}>

                                        <div className="category-card-top">
                                            <span className="tag tag-purple">{c.documentCount} document{c.documentCount === 1 ? "" : "s"}</span>
                                        </div>

                                        <h4>{c.name}</h4>

                                        <p>{c.description || "No description."}</p>

                                        <div className="category-card-actions">

                                            <button onClick={() => openEdit(c)}>
                                                <EditIcon /> Edit
                                            </button>

                                            <button
                                                className="danger"
                                                onClick={() => handleDelete(c)}
                                                disabled={deletingId === c.id}
                                            >
                                                <TrashIcon /> Delete
                                            </button>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>


                    {modalOpen && (

                        <div className="upload-modal-overlay" onClick={closeModal}>

                            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>

                                <div className="upload-modal-header">
                                    <h3>{editingId ? "Edit Category" : "Add Category"}</h3>
                                    <button className="upload-modal-close" onClick={closeModal}>×</button>
                                </div>

                                <form onSubmit={handleSubmit}>

                                    <div className="upload-field">
                                        <label>Name <em>*</em></label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                            placeholder="e.g. Criminal Law"
                                        />
                                    </div>

                                    <div className="upload-field">
                                        <label>Description</label>
                                        <input
                                            type="text"
                                            value={form.description}
                                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                            placeholder="Short description (optional)"
                                        />
                                    </div>

                                    {formError && <div className="upload-form-message error">{formError}</div>}

                                    <div className="upload-modal-actions">
                                        <button type="button" className="upload-modal-cancel" onClick={closeModal}>Cancel</button>
                                        <button type="submit" className="upload-submit-btn" disabled={saving}>
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                    </div>

                                </form>

                            </div>

                        </div>

                    )}

                </>

            )}

        </AdminDashboardLayout>

    );

}


function PlusIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>); }

function EditIcon() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15.2 4.5l4.3 4.3-10 10-4.7.4.4-4.7 10-10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>); }

function TrashIcon() { return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M18 7l-.8 12a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>); }


export default Categories;
