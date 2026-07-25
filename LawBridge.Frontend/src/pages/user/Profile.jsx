import { useRef, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { updateProfile, uploadProfilePicture, changePassword } from "../../services/userService";
import { getAssetUrl } from "../../utils/imageUrl";
import { useLanguage } from "../../context/LanguageContext";
import "./Profile.css";


const LANGUAGES = ["English", "Sinhala", "Tamil"];


function Profile()
{

    const { t } = useLanguage();

    return (

        <DashboardLayout title={t("profile_page_title")} subtitle={t("profile_page_subtitle")}>

            {({ user, refreshUser }) => (
                <ProfileContent user={user} refreshUser={refreshUser} />
            )}

        </DashboardLayout>

    );

}


function ProfileContent({ user, refreshUser })
{

    const { t, setLanguage } = useLanguage();

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

        // Translate the whole site immediately when the person picks a
        // language, without waiting for them to save the form.
        if (e.target.name === "preferredLanguage")
        {
            setLanguage(e.target.value);
        }
    };


    const handleSaveProfile = async (e) =>
    {
        e.preventDefault();

        setSavingProfile(true);

        setProfileMessage({ type: "", text: "" });

        try
        {
            await updateProfile(form);

            await refreshUser();

            setEditing(false);

            setProfileMessage({ type: "success", text: t("profile_updated_success") });
        }
        catch (err)
        {
            setProfileMessage({

                type: "error",

                text: err.response?.data?.message || t("profile_update_failed")

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
            await uploadProfilePicture(file);

            await refreshUser();
        }
        catch (err)
        {
            setAvatarError(

                err.response?.data?.message || t("profile_upload_failed")

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
            setPasswordMessage({ type: "error", text: t("profile_passwords_mismatch") });

            return;
        }

        setSavingPassword(true);

        try
        {
            await changePassword({

                currentPassword: passwordForm.currentPassword,

                newPassword: passwordForm.newPassword

            });

            setPasswordMessage({ type: "success", text: t("profile_password_changed") });

            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

            setShowPasswordForm(false);
        }
        catch (err)
        {
            setPasswordMessage({

                type: "error",

                text: err.response?.data?.message || t("profile_password_change_failed")

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
        : "";

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
        : "";


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


                {uploadingAvatar && <p className="avatar-status">{t("common_loading")}</p>}

                {avatarError && <p className="avatar-status error">{avatarError}</p>}

                {!uploadingAvatar && !avatarError && (
                    <button className="change-photo-btn" onClick={handleAvatarClick}>
                        {t("profile_change_photo")}
                    </button>
                )}


                <h2 className="avatar-name">{user.name}</h2>

                <span className="member-badge">{t("profile_member_badge")}</span>


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

                    {memberSince && (
                        <li>
                            <CalendarIcon />
                            <span>{t("profile_member_since")} {memberSince}</span>
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

                        <h3>{t("profile_account_info")}</h3>

                        {!editing && (
                            <button className="btn btn-outline btn-sm" onClick={startEditing}>
                                {t("common_edit")}
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
                                <dt>{t("profile_full_name")}</dt>
                                <dd>{user.name}</dd>
                            </div>

                            <div className="info-row">
                                <dt>{t("profile_email")}</dt>
                                <dd>{user.email}</dd>
                            </div>

                            <div className="info-row">
                                <dt>{t("profile_phone")}</dt>
                                <dd>{user.phoneNumber || "—"}</dd>
                            </div>

                            <div className="info-row">
                                <dt>{t("profile_address")}</dt>
                                <dd>{user.address || "—"}</dd>
                            </div>

                            <div className="info-row">
                                <dt>{t("profile_language")}</dt>
                                <dd>{user.preferredLanguage}</dd>
                            </div>

                        </dl>

                    ) : (

                        <form className="info-form" onSubmit={handleSaveProfile}>

                            <div className="form-field">

                                <label>{t("profile_full_name")}</label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    required
                                />

                            </div>


                            <div className="form-field">

                                <label>{t("profile_email")}</label>

                                <input value={user.email} disabled />

                            </div>


                            <div className="form-field">

                                <label>{t("profile_phone")}</label>

                                <input
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={handleFormChange}
                                    placeholder={t("profile_phone_placeholder")}
                                />

                            </div>


                            <div className="form-field">

                                <label>{t("profile_address")}</label>

                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleFormChange}
                                    placeholder={t("profile_address_placeholder")}
                                />

                            </div>


                            <div className="form-field">

                                <label>{t("profile_language")}</label>

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
                                    {t("common_cancel")}
                                </button>

                                <button type="submit" className="btn btn-primary btn-sm" disabled={savingProfile}>
                                    {savingProfile ? t("profile_saving") : t("profile_save_changes")}
                                </button>

                            </div>

                        </form>

                    )}

                </div>


                {/* Security / password */}

                <div className="profile-card">

                    <div className="card-header">

                        <h3>{t("profile_security")}</h3>

                        {!showPasswordForm && (
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setPasswordMessage({ type: "", text: "" });
                                    setShowPasswordForm(true);
                                }}
                            >
                                {t("profile_change_password")}
                            </button>
                        )}

                    </div>


                    {!showPasswordForm && (

                        <p className="security-hint">
                            {t("profile_security_hint")}
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

                                <label>{t("profile_current_password")}</label>

                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordFormChange}
                                    required
                                />

                            </div>


                            <div className="form-field">

                                <label>{t("profile_new_password")}</label>

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

                                <label>{t("profile_confirm_password")}</label>

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
                                    {t("common_cancel")}
                                </button>

                                <button type="submit" className="btn btn-primary btn-sm" disabled={savingPassword}>
                                    {savingPassword ? t("profile_updating") : t("profile_update_password")}
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


function CalendarIcon()
{
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5.5" width="16" height="14.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M4 10h16M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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


export default Profile;
