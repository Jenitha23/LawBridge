import { useEffect, useState } from "react";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import { getUsers, updateUserStatus } from "../../services/adminUserService";
import "./UploadDocument.css";
import "./Users.css";


function formatDate(dateString)
{
    const d = new Date(dateString);

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}


function Users()
{

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [togglingId, setTogglingId] = useState(null);


    const loadUsers = async () =>
    {
        try
        {
            const data = await getUsers();

            setUsers(data);

            setError("");
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                "Could not load users."
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
        loadUsers();

    }, []);


    const handleToggle = async (user) =>
    {
        const nextActive = !user.isActive;

        const verb = nextActive ? "enable" : "disable";

        if (!window.confirm(`${verb === "enable" ? "Enable" : "Disable"} ${user.name}'s account?`)) return;

        setTogglingId(user.id);

        try
        {
            await updateUserStatus(user.id, nextActive);

            setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: nextActive } : u));
        }
        catch (err)
        {
            setError(
                err.response?.data?.message ||
                `Could not ${verb} user.`
            );
        }
        finally
        {
            setTogglingId(null);
        }
    };


    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );


    return (

        <AdminDashboardLayout title="Users">

            {() => (

                <section className="admin-panel">

                    <div className="admin-panel-header upload-list-header">
                        <h3>Registered Users</h3>

                        <div className="upload-search">
                            <SearchIcon />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>


                    {error && <div className="upload-page-error">{error}</div>}


                    {loading ? (

                        <p className="admin-panel-muted">Loading users…</p>

                    ) : filteredUsers.length === 0 ? (

                        <p className="admin-panel-muted">No users found.</p>

                    ) : (

                        <div className="upload-table-wrap">

                            <table className="upload-table">

                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Language</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredUsers.map((u) => (

                                        <tr key={u.id}>

                                            <td className="upload-doc-title">{u.name}</td>

                                            <td>{u.email}</td>

                                            <td>{u.preferredLanguage}</td>

                                            <td>{formatDate(u.createdAt)}</td>

                                            <td>
                                                <span className={`status-pill ${u.isActive ? "status-processed" : "status-failed"}`}>
                                                    {u.isActive ? "Active" : "Disabled"}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className={`users-toggle-btn ${u.isActive ? "" : "enable"}`}
                                                    onClick={() => handleToggle(u)}
                                                    disabled={togglingId === u.id}
                                                >
                                                    {u.isActive ? "Disable" : "Enable"}
                                                </button>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            )}

        </AdminDashboardLayout>

    );

}


function SearchIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>); }


export default Users;
