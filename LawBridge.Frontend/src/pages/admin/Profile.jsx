import { useRef, useState } from "react";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";
import { updateAdminProfile, uploadAdminProfileImage, changeAdminPassword } from "../../services/adminService";
import { getAssetUrl } from "../../utils/imageUrl";
import "../user/Profile.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];


function AdminProfile()
{

    return (

        <AdminDashboardLayout title="My Profile">

            {({ user, refreshUser }) => (
                <AdminProfileContent user={user} refreshUser={refreshUser} />
            )}

        </AdminDashboardLayout>

    );

}


function AdminProfileContent({ user, refreshUser })
{

    const fileInputRef = useRef(null);

    // ---- Account info edit state ----
    const [editing, setEditing] = useState(false);

    const [form, setForm] = useState({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        preferredLanguage: user.preferredLanguage || "English"
    });

    const [savingProfile, setSavingProfile] = useState(false);

    const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });


    // ---- Avatar upload state ----
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [avatarError, setAvatarError] = useState("");


    // ---- Password change state ----
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    const [savingPassword, setSavingPassword] = useState(false);

    const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });


    const startEditing = () =>
    {
        setForm({
            name: user.name || "",
            phoneNumber: user.phoneNumber || "",
            address: user.address || "",
            preferredLanguage: user.preferredLanguage || "English"
        });

        setProfileMessage({ type: "", text: "" });

        setEditing(true);
    };


    const handleFormChange = (e) =>
    {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleSaveProfile = async (e) =>
    {
        e.preventDefault();

        setSavingProfile(true);

        setProfileMessage({ type: "", text: "" });

        try
        {
            await updateAdminProfile(form);

            await refreshUser();

            setEditing(false);

            setProfileMessage({ type: "success", text: "Profile updated successfully." });
        }
        catch (err)
        {
            setProfileMessage({

                type: "error",

                text: err.response?.data?.message || "Could not update your profile."

            });
        }
        finally
        {
            setSavingProfile(false);
        }
    };


    const handleAvatarClick = () =>
    {
        fileInputRef.current?.click();
    };


    const handleAvatarChange = async (e) =>
    {
        const file = e.target.files?.[0];

        if (!file)
        {
            return;
        }

        setUploadingAvatar(true);

        setAvatarError("");

        try
        {
            await uploadAdminProfileImage(file);

            await refreshUser();
        }
        catch (err)
        {
            setAvatarError(

                err.response?.data?.message || "Could not upload image."

            );
        }
        finally
        {
            setUploadingAvatar(false);

            e.target.value = "";
        }
    };


    const handlePasswordFormChange = (e) =>
    {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };


    const handleChangePassword = async (e) =>
    {
        e.preventDefault();

        setPasswordMessage({ type: "", text: "" });

        if (passwordForm.newPassword !== passwordForm.confirmPassword)
        {
            setPasswordMessage({ type: "error", text: "New passwords do not match." });

            return;
        }

        setSavingPassword(true);

        try
        {
            await changeAdminPassword({

                currentPassword: passwordForm.currentPassword,

                newPassword: passwordForm.newPassword

            });

            setPasswordMessage({ type: "success", text: "Password changed successfully." });

            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

            setShowPasswordForm(false);
        }
        catch (err)
        {
            setPasswordMessage({

                type: "error",

                text: err.response?.data?.message || "Could not change password."

            });
        }
        finally
        {
            setSavingPassword(false);
        }
    };


    const avatarUrl = getAssetUrl(user.profileImage);

    const initials = user.name
        ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
        : "A";


    return (

        <div className="profile-grid">

            {/* ---------- Left: avatar card ---------- */}

            <div className="profile-card avatar-card">

                <div className="avatar-frame">

                    {avatarUrl ? (

                        <img src={avatarUrl} alt={user.name} className="avatar-img" />

                    ) : (

                        <div className="avatar-img avatar-fallback">{initials}</div>

                    )}

                    <button
                        className="avatar-edit-btn"
                        onClick={handleAvatarClick}
                        disabled={uploadingAvatar}
                        aria-label="Change profile picture"
                    >

                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M4 17.5V20h2.5L18 8.5l-2.5-2.5L4 17.5Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                        </svg>

                    </button>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        style={{ display: "none" }}
                    />

                </div>


                {uploadingAvatar && <p className="avatar-status">Uploading...</p>}

                {avatarError && <p className="avatar-status error">{avatarError}</p>}

                {!uploadingAvatar && !avatarError && (
                    <button className="change-photo-btn" onClick={handleAvatarClick}>
                        Change Photo
                    </button>
                )}


                <h2 className="avatar-name">{user.name}</h2>

                <span className="member-badge">{user.role || "Administrator"}</span>


                <ul className="avatar-meta">

                    <li>
                        <MailIcon />
                        <span>{user.email}</span>
                    </li>

                    {user.phoneNumber && (
                        <li>
                            <PhoneIcon />
                            <span>{user.phoneNumber}</span>
                        </li>
                    )}

                    {user.address && (
                        <li>
                            <PinIcon />
                            <span>{user.address}</span>
                        </li>
                    )}

                </ul>

            </div>


            {/* ---------- Right column ---------- */}

            <div className="profile-right">

                {/* Account information */}

                <div className="profile-card">

                    <div className="card-header">

                        <h3>Account Information</h3>

                        {!editing && (
                            <button className="btn btn-outline btn-sm" onClick={startEditing}>
                                Edit
                            </button>
                        )}

                    </div>


                    {profileMessage.text && !editing && (

                        <div className={`inline-message ${profileMessage.type}`}>
                            {profileMessage.text}
                        </div>

                    )}


                    {!editing ? (

                        <dl className="info-list">

                            <div className="info-row">
                                <dt>Full Name</dt>
                                <dd>{user.name}</dd>
                            </div>

                            <div className="info-row">
                                <dt>Email Address</dt>
                                <dd>{user.email}</dd>
                            </div>

                            <div className="info-row">
                                <dt>Phone Number</dt>
                                <dd>{user.phoneNumber || "—"}</dd>
                            </div>

                            <div className="info-row">
                                <dt>Address</dt>
                                <dd>{user.address || "—"}</dd>
                            </div>

                            <div className="info-row">
                                <dt>Language</dt>
                                <dd>{user.preferredLanguage}</dd>
                            </div>

                            <div className="info-row">
                                <dt>Role</dt>
                                <dd>{user.role}</dd>
                            </div>

                        </dl>

                    ) : (

                        <form className="info-form" onSubmit={handleSaveProfile}>

                            <div className="form-field">

                                <label>Full Name</label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    required
                                />

                            </div>


                            <div className="form-field">

                                <label>Email Address</label>

                                <input value={user.email} disabled />

                            </div>


                            <div className="form-field">

                                <label>Phone Number</label>

                                <input
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={handleFormChange}
                                    placeholder="+94 77 123 4567"
                                />

                            </div>


                            <div className="form-field">

                                <label>Address</label>

                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleFormChange}
                                    placeholder="Your address"
                                />

                            </div>


                            <div className="form-field">

                                <label>Language</label>

                                <select
                                    name="preferredLanguage"
                                    value={form.preferredLanguage}
                                    onChange={handleFormChange}
                                >

                                    {LANGUAGES.map((lang) => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}

                                </select>

                            </div>


                            {profileMessage.text && (

                                <div className={`inline-message ${profileMessage.type}`}>
                                    {profileMessage.text}
                                </div>

                            )}


                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setEditing(false)}
                                    disabled={savingProfile}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="btn btn-primary btn-sm" disabled={savingProfile}>
                                    {savingProfile ? "Saving..." : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    )}

                </div>


                {/* Security / password */}

                <div className="profile-card">

                    <div className="card-header">

                        <h3>Security</h3>

                        {!showPasswordForm && (
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setPasswordMessage({ type: "", text: "" });
                                    setShowPasswordForm(true);
                                }}
                            >
                                Change Password
                            </button>
                        )}

                    </div>


                    {!showPasswordForm && (

                        <p className="security-hint">
                            Keep your admin account secure with a strong, unique password.
                        </p>

                    )}


                    {passwordMessage.text && !showPasswordForm && (

                        <div className={`inline-message ${passwordMessage.type}`}>
                            {passwordMessage.text}
                        </div>

                    )}


                    {showPasswordForm && (

                        <form className="info-form" onSubmit={handleChangePassword}>

                            <div className="form-field">

                                <label>Current Password</label>

                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordFormChange}
                                    required
                                />

                            </div>


                            <div className="form-field">

                                <label>New Password</label>

                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordFormChange}
                                    required
                                    minLength={6}
                                />

                            </div>


                            <div className="form-field">

                                <label>Confirm New Password</label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordFormChange}
                                    required
                                    minLength={6}
                                />

                            </div>


                            {passwordMessage.text && (

                                <div className={`inline-message ${passwordMessage.type}`}>
                                    {passwordMessage.text}
                                </div>

                            )}


                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setShowPasswordForm(false)}
                                    disabled={savingPassword}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="btn btn-primary btn-sm" disabled={savingPassword}>
                                    {savingPassword ? "Updating..." : "Update Password"}
                                </button>

                            </div>

                        </form>

                    )}

                </div>

            </div>

        </div>

    );

}


function MailIcon()
{
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M4 6.5l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}


function PhoneIcon()
{
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M6 4h3l1.5 4-2 1.3a10 10 0 0 0 5 5l1.3-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 4.5 5.6 1.5 1.5 0 0 1 6 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}


function PinIcon()
{
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s7-6.5 7-11.5A7 7 0 1 0 5 9.5C5 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}


export default AdminProfile;
