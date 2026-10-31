import ActivityDashboard from "../components/ActivityDashboard";
import SaveToggle from "../components/SaveToggle";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Bookmark, Folder, Heart, Settings, Search,
  Plus, Bell, ArrowUpRight, Globe, LogOut, MoreHorizontal, Code2,
  Palette, BookOpen, Video, Sparkles, ChevronDown, Link2,
  X, Check, FileText, Pencil, Trash2, FolderPlus, ArrowLeft,
} from "lucide-react";

// --------------------------------------------------
// API HELPERS
// --------------------------------------------------

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

// --------------------------------------------------
// NAVIGATION AND CATEGORIES
// --------------------------------------------------

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "All Links", icon: Bookmark },
  { label: "Collections", icon: Folder },
  { label: "Favorites", icon: Heart },
];

const categories = [
  "All",
  "Development",
  "Design",
  "Learning",
  "Videos",
];

const categoryDetails = {
  Development: { icon: Code2, color: "blue" },
  Design: { icon: Palette, color: "pink" },
  Learning: { icon: BookOpen, color: "purple" },
  Videos: { icon: Video, color: "red" },
  Other: { icon: Globe, color: "green" },
};

const collectionIcons = {
  Folder,
  Code2,
  Palette,
  BookOpen,
  Video,
  Sparkles,
  Globe,
};

const collectionColors = [
  "blue",
  "purple",
  "pink",
  "green",
  "orange",
];

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

function getCategoryDetails(category) {
  return categoryDetails[category] || categoryDetails.Other;
}

function formatBookmarkDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function normalizeBookmark(bookmark) {
  const details = getCategoryDetails(bookmark.category);

  return {
    ...bookmark,
    id: bookmark.id,
    title: bookmark.title || "",
    description: bookmark.description || "",
    url: (bookmark.url || "").replace(/^https?:\/\//i, "").replace(/\/$/, ""),
    category: bookmark.category || "Other",
    notes: bookmark.notes || "",
    favorite: Boolean(bookmark.is_favorite),
    collectionIds: Array.isArray(bookmark.collectionIds)
      ? bookmark.collectionIds
      : [],
    createdAt: bookmark.created_at || new Date().toISOString(),
    date: formatBookmarkDate(bookmark.created_at),
    icon: details.icon,
    color: details.color,
  };
}

function normalizeCollection(collection) {
  return {
    ...collection,
    id: collection.id,
    name: collection.name || "",
    description: collection.description || "",
    icon: collection.icon || "Folder",
    color: collection.color || "purple",
  };
}

// --------------------------------------------------
// MAIN DASHBOARD
// --------------------------------------------------

export default function Dashboard() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const [activePage, setActivePage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Every account starts with an empty workspace.
  const [collections, setCollections] = useState([]);
  const [links, setLinks] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  const [selectedCollectionId, setSelectedCollectionId] = useState(null);

  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deleteCollectionTarget, setDeleteCollectionTarget] = useState(null);

  const [collectionForm, setCollectionForm] = useState({
    name: "",
    description: "",
    icon: "Folder",
    color: "purple",
  });

  const [collectionError, setCollectionError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [savingCollection, setSavingCollection] = useState(false);

  const [newLink, setNewLink] = useState({
    url: "",
    title: "",
    description: "",
    category: "Development",
    notes: "",
    collectionIds: [],
  });

  // --------------------------------------------------
  // LOAD AUTHENTICATED USER AND CLOUD DATA
  // --------------------------------------------------

  useEffect(() => {
    let active = true;

    async function loadWorkspace() {
      try {
        const authData = await apiRequest("/api/auth/me");

        if (!active) return;

        setCurrentUser(authData.user);

        const [bookmarkData, collectionData] = await Promise.all([
          apiRequest("/api/bookmarks"),
          apiRequest("/api/collections"),
        ]);

        if (!active) return;

        const loadedBookmarks = (bookmarkData.bookmarks || []).map(
          normalizeBookmark
        );

        const loadedCollections = (collectionData.collections || []).map(
          normalizeCollection
        );

        setLinks(loadedBookmarks);
        setCollections(loadedCollections);

        setSavedIds(
          loadedBookmarks
            .filter((bookmark) => Boolean(bookmark.is_saved))
            .map((bookmark) => bookmark.id)
        );
      } catch (error) {
        console.error("Could not load Linkspace workspace:", error);

        if (!active) return;

        if (
          error.message?.toLowerCase().includes("log in") ||
          error.message?.toLowerCase().includes("unauthorized")
        ) {
          navigate("/login", { replace: true });
          return;
        }

        setWorkspaceError(error.message || "Could not load your workspace.");
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    loadWorkspace();

    return () => {
      active = false;
    };
  }, [navigate]);

  // --------------------------------------------------
  // LOG OUT
  // --------------------------------------------------

  const handleLogout = async () => {
    setLogoutError("");

    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });

      setCurrentUser(null);
      setLinks([]);
      setCollections([]);
      setSavedIds([]);

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError(error.message || "Could not log out. Please try again.");
    }
  };

  // --------------------------------------------------
  // SELECTED COLLECTION
  // --------------------------------------------------

  const selectedCollection = collections.find(
    (collection) => String(collection.id) === String(selectedCollectionId)
  );

  // --------------------------------------------------
  // FILTER BOOKMARKS
  // --------------------------------------------------

  const filteredLinks = links.filter((link) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      link.title.toLowerCase().includes(searchText) ||
      link.description.toLowerCase().includes(searchText) ||
      link.url.toLowerCase().includes(searchText) ||
      (link.notes || "").toLowerCase().includes(searchText);

    const matchesCategory =
      activeCategory === "All" || link.category === activeCategory;

    const matchesPage =
      activePage !== "Favorites" || link.favorite;

    const matchesCollection =
      activePage !== "Collections" ||
      !selectedCollectionId ||
      (link.collectionIds || []).some(
        (id) => String(id) === String(selectedCollectionId)
      );

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPage &&
      matchesCollection
    );
  });

  // --------------------------------------------------
  // CATEGORY ANALYTICS
  // --------------------------------------------------

  const categoryAnalytics = [
    { name: "Development", color: "#60a5fa" },
    { name: "Design", color: "#ec70ae" },
    { name: "Learning", color: "#a78bfa" },
    { name: "Videos", color: "#f87171" },
    { name: "Other", color: "#34d399" },
  ].map((category) => {
    const count = links.filter(
      (link) => link.category === category.name
    ).length;

    return {
      ...category,
      count,
      percentage: links.length
        ? Math.round((count / links.length) * 100)
        : 0,
    };
  });

  let categoryOffset = 0;

  const categoryChartBackground = categoryAnalytics
    .map((category) => {
      const start = categoryOffset;
      categoryOffset += category.percentage;

      return `${category.color} ${start}% ${categoryOffset}%`;
    })
    .join(", ");

  // --------------------------------------------------
  // FAVORITES
  // --------------------------------------------------

  const toggleFavorite = async (id) => {
    const link = links.find((item) => item.id === id);
    if (!link) return;

    const nextFavorite = !link.favorite;

    try {
      setWorkspaceError("");

      await apiRequest(`/api/bookmarks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          is_favorite: nextFavorite,
        }),
      });

      setLinks((previous) =>
        previous.map((item) =>
          item.id === id
            ? { ...item, favorite: nextFavorite }
            : item
        )
      );
    } catch (error) {
      console.error("Could not update favorite:", error);
      setWorkspaceError(error.message || "Could not update favorite.");
    }
  };

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  const selectPage = (page) => {
    setActivePage(page);
    setActiveCategory("All");
    setSearch("");
    setSelectedCollectionId(null);
  };

  // --------------------------------------------------
  // BOOKMARK FORM
  // --------------------------------------------------

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setNewLink((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
    setFormSuccess(false);
  };

  const toggleCollectionAssignment = (collectionId) => {
    setNewLink((previous) => {
      const current = previous.collectionIds || [];

      const alreadySelected = current.some(
        (id) => String(id) === String(collectionId)
      );

      return {
        ...previous,
        collectionIds: alreadySelected
          ? current.filter((id) => String(id) !== String(collectionId))
          : [...current, collectionId],
      };
    });
  };

  const openAddModal = () => {
    setEditingLink(null);

    setNewLink({
      url: "",
      title: "",
      description: "",
      category: "Development",
      notes: "",
      collectionIds: selectedCollectionId
        ? [selectedCollectionId]
        : [],
    });

    setFormError("");
    setFormSuccess(false);
    setShowAddModal(true);
  };

  const openEditModal = (link) => {
    setEditingLink(link.id);

    setNewLink({
      url: link.url,
      title: link.title,
      description: link.description,
      category: link.category,
      notes: link.notes || "",
      collectionIds: link.collectionIds || [],
    });

    setFormError("");
    setFormSuccess(false);
    setShowAddModal(true);
  };

  // --------------------------------------------------
  // ADD OR UPDATE BOOKMARK IN D1
  // --------------------------------------------------

  const handleSaveLink = async (e) => {
    e.preventDefault();

    setFormError("");
    setFormSuccess(false);

    const enteredUrl = newLink.url.trim();

    if (!enteredUrl) {
      setFormError("Please enter a website URL.");
      return;
    }

    let finalUrl = enteredUrl;

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      new URL(finalUrl);
    } catch {
      setFormError("Please enter a valid website URL.");
      return;
    }

    if (!newLink.title.trim()) {
      setFormError("Please enter a title for your bookmark.");
      return;
    }

    const cleanedUrl = finalUrl
      .replace(/^https?:\/\//i, "")
      .replace(/\/$/, "");

    const payload = {
      title: newLink.title.trim(),
      description: newLink.description.trim() || "No description added.",
      url: cleanedUrl,
      category: newLink.category,
      notes: newLink.notes.trim(),
      collectionIds: newLink.collectionIds,
    };

    setSavingLink(true);

    try {
      setWorkspaceError("");

      if (editingLink !== null) {
        const data = await apiRequest(`/api/bookmarks/${editingLink}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        const updatedBookmark = normalizeBookmark(data.bookmark);

        setLinks((previous) =>
          previous.map((link) =>
            link.id === editingLink ? updatedBookmark : link
          )
        );

        setSavedIds((previous) =>
          updatedBookmark.is_saved
            ? previous.includes(updatedBookmark.id)
              ? previous
              : [...previous, updatedBookmark.id]
            : previous.filter((id) => id !== updatedBookmark.id)
        );
      } else {
        const data = await apiRequest("/api/bookmarks", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const createdBookmark = normalizeBookmark(data.bookmark);

        setLinks((previous) => [createdBookmark, ...previous]);
      }

      setFormSuccess(true);

      window.setTimeout(() => {
        setShowAddModal(false);
        setEditingLink(null);
        setFormSuccess(false);
        setActivePage("All Links");
        setSelectedCollectionId(null);
        setActiveCategory("All");
        setSearch("");
      }, 650);
    } catch (error) {
      console.error("Could not save bookmark:", error);
      setFormError(error.message || "Could not save your bookmark.");
    } finally {
      setSavingLink(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingLink(null);
    setFormError("");
    setFormSuccess(false);
  };

  // --------------------------------------------------
  // SAVE FOR LATER IN D1
  // --------------------------------------------------

  const handleSaveStatus = useCallback(async (id, status) => {
    const shouldSave = status === "saved";

    try {
      setWorkspaceError("");

      await apiRequest(`/api/bookmarks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          is_saved: shouldSave,
        }),
      });

      setSavedIds((previous) => {
        if (shouldSave) {
          return previous.includes(id) ? previous : [...previous, id];
        }

        return previous.filter((savedId) => savedId !== id);
      });

      setLinks((previous) =>
        previous.map((link) =>
          link.id === id
            ? { ...link, is_saved: shouldSave }
            : link
        )
      );
    } catch (error) {
      console.error("Could not update saved status:", error);
      setWorkspaceError(error.message || "Could not update saved status.");
    }
  }, []);

  // --------------------------------------------------
  // DELETE BOOKMARK FROM D1
  // --------------------------------------------------

  const askDelete = (link) => {
    setDeleteTarget(link);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const id = deleteTarget.id;

    try {
      setWorkspaceError("");

      await apiRequest(`/api/bookmarks/${id}`, {
        method: "DELETE",
      });

      setLinks((previous) =>
        previous.filter((link) => link.id !== id)
      );

      setSavedIds((previous) =>
        previous.filter((savedId) => savedId !== id)
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error("Could not delete bookmark:", error);
      setWorkspaceError(error.message || "Could not delete bookmark.");
    }
  };

  // --------------------------------------------------
  // COLLECTION MODALS
  // --------------------------------------------------

  const openCreateCollection = () => {
    setEditingCollection(null);

    setCollectionForm({
      name: "",
      description: "",
      icon: "Folder",
      color: "purple",
    });

    setCollectionError("");
    setShowCollectionModal(true);
  };

  const openEditCollection = (collection) => {
    setEditingCollection(collection.id);

    setCollectionForm({
      name: collection.name,
      description: collection.description || "",
      icon: collection.icon || "Folder",
      color: collection.color || "purple",
    });

    setCollectionError("");
    setShowCollectionModal(true);
  };

  const handleCollectionFormChange = (e) => {
    const { name, value } = e.target;

    setCollectionForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setCollectionError("");
  };

  // --------------------------------------------------
  // CREATE OR UPDATE COLLECTION IN D1
  // --------------------------------------------------

  const handleSaveCollection = async (e) => {
    e.preventDefault();

    const name = collectionForm.name.trim();

    if (!name) {
      setCollectionError("Please enter a collection name.");
      return;
    }

    const duplicate = collections.some(
      (collection) =>
        collection.name.toLowerCase() === name.toLowerCase() &&
        String(collection.id) !== String(editingCollection)
    );

    if (duplicate) {
      setCollectionError("A collection with this name already exists.");
      return;
    }

    setSavingCollection(true);

    try {
      setWorkspaceError("");

      const payload = {
        ...collectionForm,
        name,
      };

      if (editingCollection !== null) {
        const data = await apiRequest(
          `/api/collections/${editingCollection}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );

        const updatedCollection = normalizeCollection(data.collection);

        setCollections((previous) =>
          previous.map((collection) =>
            collection.id === editingCollection
              ? updatedCollection
              : collection
          )
        );
      } else {
        const data = await apiRequest("/api/collections", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setCollections((previous) => [
          ...previous,
          normalizeCollection(data.collection),
        ]);
      }

      setShowCollectionModal(false);
      setEditingCollection(null);
    } catch (error) {
      console.error("Could not save collection:", error);
      setCollectionError(error.message || "Could not save collection.");
    } finally {
      setSavingCollection(false);
    }
  };

  // --------------------------------------------------
  // DELETE COLLECTION FROM D1
  // --------------------------------------------------

  const confirmDeleteCollection = async () => {
    if (!deleteCollectionTarget) return;

    const id = deleteCollectionTarget.id;

    try {
      setWorkspaceError("");

      await apiRequest(`/api/collections/${id}`, {
        method: "DELETE",
      });

      setCollections((previous) =>
        previous.filter((collection) => collection.id !== id)
      );

      setLinks((previous) =>
        previous.map((link) => ({
          ...link,
          collectionIds: (link.collectionIds || []).filter(
            (collectionId) => String(collectionId) !== String(id)
          ),
        }))
      );

      if (String(selectedCollectionId) === String(id)) {
        setSelectedCollectionId(null);
      }

      setDeleteCollectionTarget(null);
    } catch (error) {
      console.error("Could not delete collection:", error);
      setWorkspaceError(error.message || "Could not delete collection.");
    }
  };

  const openCollection = (id) => {
    setSelectedCollectionId(id);
    setActivePage("Collections");
    setActiveCategory("All");
    setSearch("");
  };

  const goBackToCollections = () => {
    setSelectedCollectionId(null);
    setActiveCategory("All");
    setSearch("");
  };

  // --------------------------------------------------
  // BOOKMARK CARD
  // --------------------------------------------------

  const renderBookmarkCard = (link) => {
    const Icon = link.icon || Globe;

    return (
      <motion.article
        className="bookmark-card"
        key={link.id}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bookmark-card-top">
          <div className={`bookmark-icon ${link.color || "blue"}`}>
            <Icon size={22} />
          </div>

          <div className="bookmark-actions">
            <button
              className="bookmark-action-button"
              onClick={() => openEditModal(link)}
              aria-label={`Edit ${link.title}`}
              title="Edit bookmark"
            >
              <Pencil size={16} />
            </button>

            <button
              className="bookmark-action-button delete-action"
              onClick={() => askDelete(link)}
              aria-label={`Delete ${link.title}`}
              title="Delete bookmark"
            >
              <Trash2 size={16} />
            </button>

            <button
              className={`favorite-button ${link.favorite ? "is-favorite" : ""}`}
              onClick={() => toggleFavorite(link.id)}
              aria-label="Toggle favorite"
            >
              <Heart
                size={18}
                fill={link.favorite ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>

        <div className="bookmark-card-info">
          <div className="bookmark-title-row">
            <h3>{link.title}</h3>

            <a
              href={`https://${link.url}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${link.title}`}
            >
              <ArrowUpRight size={16} />
            </a>
          </div>

          <p>{link.description}</p>

          {link.notes && (
            <div className="bookmark-notes">
              <FileText size={13} />
              {link.notes}
            </div>
          )}

          {(link.collectionIds || []).length > 0 && (
            <div className="bookmark-collection-tags">
              {collections
                .filter((collection) =>
                  link.collectionIds.some(
                    (id) => String(id) === String(collection.id)
                  )
                )
                .map((collection) => (
                  <span key={collection.id}>
                    <Folder size={11} />
                    {collection.name}
                  </span>
                ))}
            </div>
          )}
        </div>

        <SaveToggle
          key={link.id}
          size="md"
          idleText="Save"
          savedText="Saved"
          initialStatus={
            savedIds.includes(link.id) ? "saved" : "idle"
          }
          onStatusChange={(status) =>
            handleSaveStatus(link.id, status)
          }
        />

        <div className="bookmark-card-footer">
          <span className="bookmark-domain">
            <Globe size={13} /> {link.url}
          </span>

          <span className="bookmark-date">{link.date}</span>
        </div>
      </motion.article>
    );
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (authLoading) {
    return (
      <div
        className="dashboard-layout"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <p style={{ color: "white" }}>
          Loading your Linkspace workspace...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // DASHBOARD UI
  // --------------------------------------------------

  return (
    <div className="dashboard-layout">
      <motion.aside
        className="dashboard-sidebar"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <a href="/" className="dashboard-brand">
          <span className="brand-mark">L</span>
          Linkspace
        </a>

        <div className="sidebar-section">
          <span className="sidebar-label">WORKSPACE</span>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <motion.button
                key={item.label}
                className={`sidebar-link ${
                  activePage === item.label ? "active" : ""
                }`}
                onClick={() => selectPage(item.label)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <button
            className="sidebar-link"
            onClick={() => selectPage("Settings")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="profile-card"
              onClick={() => {
                setShowProfileMenu((previous) => !previous);
                setLogoutError("");
              }}
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                background: "transparent",
                border: "none",
              }}
            >
              <div className="profile-avatar">
                {(currentUser?.name || "A").charAt(0).toUpperCase()}
              </div>

              <div className="profile-info">
                <strong>{currentUser?.name || "Your Account"}</strong>
                <span>{currentUser?.email || "Personal workspace"}</span>
              </div>

              <MoreHorizontal size={19} />
            </button>

            {showProfileMenu && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 10px)",
                  left: 0,
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "rgba(20, 25, 40, 0.97)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(20px)",
                  zIndex: 20,
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <strong style={{ display: "block", fontSize: "14px" }}>
                    {currentUser?.name}
                  </strong>

                  <span style={{ fontSize: "12px", opacity: 0.65 }}>
                    {currentUser?.email}
                  </span>
                </div>

                {logoutError && (
                  <p style={{ color: "#ff8585", fontSize: "12px" }}>
                    {logoutError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    width: "100%",
                    padding: "10px",
                    borderRadius: "9px",
                    border: "1px solid rgba(255,100,100,0.2)",
                    background: "rgba(255,80,80,0.08)",
                    color: "#ff8585",
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {selectedCollection?.name || activePage}
            </strong>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>

            <div className="topbar-avatar">
              {(currentUser?.name || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {workspaceError && (
            <div
              role="alert"
              style={{
                marginBottom: "18px",
                padding: "12px 16px",
                borderRadius: "12px",
                color: "#ffaaaa",
                background: "rgba(255,80,80,0.10)",
                border: "1px solid rgba(255,100,100,0.2)",
                fontSize: "13px",
              }}
            >
              {workspaceError}
              <button
                type="button"
                onClick={() => setWorkspaceError("")}
                style={{
                  float: "right",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}
                aria-label="Dismiss error"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* WELCOME */}
          <motion.section
            className="dashboard-welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <span className="welcome-eyebrow">
                <Sparkles size={14} /> YOUR PERSONAL SPACE
              </span>

              <h1>
                {selectedCollection
                  ? selectedCollection.name
                  : activePage === "Overview"
                  ? "Your space, your knowledge."
                  : activePage}
              </h1>

              <p>
                {selectedCollection
                  ? selectedCollection.description ||
                    "Everything in this collection."
                  : "Everything worth saving, organised in one place."}
              </p>
            </div>

            {activePage === "Collections" && !selectedCollectionId ? (
              <motion.button
                className="add-link-button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={openCreateCollection}
              >
                <FolderPlus size={18} /> New collection
              </motion.button>
            ) : (
              <motion.button
                className="add-link-button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={openAddModal}
              >
                <Plus size={18} /> Add a link
              </motion.button>
            )}
          </motion.section>

          {/* STATISTICS */}
          <section className="stats-grid">
            {[
              {
                label: "Total saved links",
                value: links.length,
                icon: Bookmark,
                detail: "Your entire library",
              },
              {
                label: "Collections",
                value: collections.length,
                icon: Folder,
                detail: "Your organised spaces",
              },
              {
                label: "Favorites",
                value: links.filter((link) => link.favorite).length,
                icon: Heart,
                detail: "Your top resources",
              },
              {
                label: "Saved for later",
                value: savedIds.length,
                icon: Check,
                detail: "Your bookmarked resources",
              },
            ].map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  className="stat-card"
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="stat-top">
                    <span>{stat.label}</span>
                    <Icon size={19} />
                  </div>

                  <div className="stat-value">{stat.value}</div>

                  <span className="stat-detail">{stat.detail}</span>
                </motion.div>
              );
            })}
          </section>

          {/* ACTIVITY DASHBOARD */}
          {activePage === "Overview" && (
            <ActivityDashboard links={links} savedIds={savedIds} />
          )}

          {/* CATEGORY ANALYTICS */}
          {activePage === "Overview" && (
            <motion.section
              className="category-analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="analytics-heading">
                <div>
                  <span className="analytics-eyebrow">
                    <Sparkles size={13} /> YOUR LIBRARY
                  </span>
                  <h2>Category distribution</h2>
                  <p>See how your saved resources are organised.</p>
                </div>

                <span className="analytics-total">
                  {links.length} total links
                </span>
              </div>

              <div className="analytics-content">
                <div className="category-donut-area">
                  <div
                    className="category-donut"
                    style={{
                      background:
                        links.length > 0
                          ? `conic-gradient(${categoryChartBackground})`
                          : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="category-donut-center">
                      <strong>{links.length}</strong>
                      <span>Bookmarks</span>
                    </div>
                  </div>
                </div>

                <div className="category-breakdown">
                  {categoryAnalytics.map((category) => (
                    <div
                      className="category-breakdown-item"
                      key={category.name}
                    >
                      <div className="category-breakdown-top">
                        <div className="category-name">
                          <span
                            className="category-color-dot"
                            style={{ background: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>

                        <div className="category-count">
                          <strong>{category.count}</strong>
                          <span>{category.percentage}%</span>
                        </div>
                      </div>

                      <div className="category-progress-track">
                        <motion.div
                          className="category-progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${category.percentage}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          style={{ background: category.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* RECENTLY ADDED */}
          {activePage === "Overview" && (
            <section className="links-section overview-quick-access">
              <div className="links-heading">
                <div>
                  <h2>Recently added</h2>
                  <p>
                    Pick up where you left off with your latest saved resources.
                  </p>
                </div>

                <button
                  className="sort-button"
                  onClick={() => selectPage("All Links")}
                >
                  View all <ArrowUpRight size={15} />
                </button>
              </div>

              <div className="bookmark-grid">
                {links.length > 0 ? (
                  links.slice(0, 4).map(renderBookmarkCard)
                ) : (
                  <div className="empty-state">
                    <Bookmark size={25} />
                    <h3>Your library is waiting</h3>
                    <p>Add your first bookmark to see it here.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* COLLECTION OVERVIEW */}
          {activePage === "Collections" && !selectedCollectionId ? (
            <section className="links-section">
              <div className="links-heading">
                <div>
                  <h2>Your collections</h2>
                  <p>
                    Organise one bookmark into as many collections as you need.
                  </p>
                </div>
              </div>

              {collections.length > 0 ? (
                <div className="collections-grid">
                  {collections.map((collection, index) => {
                    const Icon =
                      collectionIcons[collection.icon] || Folder;

                    const count = links.filter((link) =>
                      (link.collectionIds || []).some(
                        (id) => String(id) === String(collection.id)
                      )
                    ).length;

                    return (
                      <motion.article
                        className="collection-card"
                        key={collection.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        whileHover={{ y: -5 }}
                        onClick={() => openCollection(collection.id)}
                      >
                        <div className="collection-card-top">
                          <div className={`collection-icon ${collection.color}`}>
                            <Icon size={23} />
                          </div>

                          <div className="collection-card-actions">
                            <button
                              className="bookmark-action-button"
                              title="Edit collection"
                              aria-label="Edit collection"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCollection(collection);
                              }}
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              className="bookmark-action-button delete-action"
                              title="Delete collection"
                              aria-label="Delete collection"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteCollectionTarget(collection);
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <h3>{collection.name}</h3>

                        <p>
                          {collection.description ||
                            "A space for your saved resources."}
                        </p>

                        <div className="collection-card-footer">
                          <span>
                            <Bookmark size={14} />
                            {count} {count === 1 ? "bookmark" : "bookmarks"}
                          </span>

                          <ArrowUpRight size={17} />
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <Folder size={27} />
                  <h3>No collections yet</h3>
                  <p>
                    Create your first collection to organise your links.
                  </p>
                </div>
              )}
            </section>
          ) : (
            <section className="links-section">
              <div className="links-heading">
                <div>
                  {selectedCollection && (
                    <button
                      className="collection-back-button"
                      onClick={goBackToCollections}
                    >
                      <ArrowLeft size={15} /> All collections
                    </button>
                  )}

                  <h2>
                    {activePage === "Favorites"
                      ? "Your favorites"
                      : selectedCollection
                      ? "Bookmarks in this collection"
                      : activePage === "All Links"
                      ? "All your links"
                      : "Recently saved"}
                  </h2>

                  <p>Explore the resources in your library.</p>
                </div>

                <button className="sort-button">
                  Recently added <ChevronDown size={15} />
                </button>
              </div>

              <div className="dashboard-search">
                <Search size={19} />

                <input
                  type="text"
                  placeholder="Search your saved links..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <span>⌘ K</span>
              </div>

              <div className="category-filters">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-chip ${
                      activeCategory === category ? "selected" : ""
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  className="bookmark-grid"
                  key={`${activePage}-${selectedCollectionId}-${activeCategory}-${search}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {filteredLinks.length > 0 ? (
                    filteredLinks.map(renderBookmarkCard)
                  ) : (
                    <div className="empty-state">
                      <Search size={25} />

                      <h3>
                        {selectedCollection
                          ? "This collection is empty"
                          : "No links found"}
                      </h3>

                      <p>
                        {selectedCollection
                          ? "Edit a bookmark to add it to this collection."
                          : "Try another search or category."}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </section>
          )}

          <footer className="dashboard-footer">
            <span>
              <Link2 size={14} /> Your digital space, beautifully organised.
            </span>

            <span>LINKSPACE © 2026</span>
          </footer>
        </div>
      </main>

      {/* --------------------------------------------------
          ADD / EDIT BOOKMARK MODAL
      -------------------------------------------------- */}

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="add-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              className="add-modal"
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 26,
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-modal-title"
            >
              <div className="add-modal-header">
                <div>
                  <span className="add-modal-eyebrow">
                    <Sparkles size={13} /> YOUR LIBRARY
                  </span>

                  <h2 id="add-modal-title">
                    {editingLink !== null
                      ? "Edit your bookmark."
                      : "Save something useful."}
                  </h2>

                  <p>
                    {editingLink !== null
                      ? "Update your saved website."
                      : "Add a website to your personal collection."}
                  </p>
                </div>

                <button
                  className="add-modal-close"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleSaveLink}>
                <label htmlFor="bookmark-url">Website URL *</label>

                <div className="add-input-wrap">
                  <Globe size={17} />

                  <input
                    id="bookmark-url"
                    name="url"
                    type="text"
                    placeholder="https://example.com"
                    value={newLink.url}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <label htmlFor="bookmark-title">Title *</label>

                <input
                  id="bookmark-title"
                  className="add-modal-input"
                  name="title"
                  type="text"
                  placeholder="e.g. React Documentation"
                  value={newLink.title}
                  onChange={handleFormChange}
                  required
                />

                <label htmlFor="bookmark-description">Description</label>

                <textarea
                  id="bookmark-description"
                  className="add-modal-input"
                  name="description"
                  placeholder="What is this website about?"
                  value={newLink.description}
                  onChange={handleFormChange}
                  rows="2"
                />

                <label htmlFor="bookmark-category">Category</label>

                <select
                  id="bookmark-category"
                  className="add-modal-input"
                  name="category"
                  value={newLink.category}
                  onChange={handleFormChange}
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Learning">Learning</option>
                  <option value="Videos">Videos</option>
                  <option value="Other">Other</option>
                </select>

                <label htmlFor="bookmark-notes">
                  Personal notes <span>(optional)</span>
                </label>

                <textarea
                  id="bookmark-notes"
                  className="add-modal-input"
                  name="notes"
                  placeholder="Add a reminder or something you want to remember..."
                  value={newLink.notes}
                  onChange={handleFormChange}
                  rows="2"
                />

                {/* COLLECTION ASSIGNMENT */}
                <div className="collection-assignment">
                  <label>Collections</label>

                  <p>
                    Choose one or more collections for this bookmark.
                  </p>

                  {collections.length > 0 ? (
                    <div className="collection-checkbox-list">
                      {collections.map((collection) => (
                        <label
                          className="collection-checkbox-item"
                          key={collection.id}
                        >
                          <input
                            type="checkbox"
                            checked={(newLink.collectionIds || []).some(
                              (id) => String(id) === String(collection.id)
                            )}
                            onChange={() =>
                              toggleCollectionAssignment(collection.id)
                            }
                          />

                          <span>{collection.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p>
                      No collections yet. Create one from the Collections page.
                    </p>
                  )}
                </div>

                {formError && (
                  <p className="add-form-error">{formError}</p>
                )}

                {formSuccess && (
                  <p className="add-form-success">
                    <Check size={16} />
                    {editingLink !== null
                      ? "Bookmark updated successfully!"
                      : "Bookmark added successfully!"}
                  </p>
                )}

                <div className="add-modal-actions">
                  <button
                    type="button"
                    className="add-cancel-button"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    className="add-submit-button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={savingLink || formSuccess}
                  >
                    {savingLink ? (
                      "Saving..."
                    ) : editingLink !== null ? (
                      <>
                        <Check size={17} /> Save changes
                      </>
                    ) : (
                      <>
                        <Plus size={17} /> Save bookmark
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------
          CREATE / EDIT COLLECTION MODAL
      -------------------------------------------------- */}

      <AnimatePresence>
        {showCollectionModal && (
          <motion.div
            className="add-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowCollectionModal(false);
              }
            }}
          >
            <motion.div
              className="add-modal collection-modal"
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 26,
              }}
              role="dialog"
              aria-modal="true"
            >
              <div className="add-modal-header">
                <div>
                  <span className="add-modal-eyebrow">
                    <Folder size={13} /> YOUR WORKSPACE
                  </span>

                  <h2>
                    {editingCollection
                      ? "Edit collection."
                      : "Create a collection."}
                  </h2>

                  <p>Give your collection its own identity.</p>
                </div>

                <button
                  className="add-modal-close"
                  onClick={() => setShowCollectionModal(false)}
                  aria-label="Close modal"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleSaveCollection}>
                <label htmlFor="collection-name">Collection name *</label>

                <input
                  id="collection-name"
                  className="add-modal-input"
                  name="name"
                  value={collectionForm.name}
                  onChange={handleCollectionFormChange}
                  placeholder="e.g. Cybersecurity Resources"
                  required
                />

                <label htmlFor="collection-description">Description</label>

                <textarea
                  id="collection-description"
                  className="add-modal-input"
                  name="description"
                  value={collectionForm.description}
                  onChange={handleCollectionFormChange}
                  placeholder="What will you keep here?"
                  rows="3"
                />

                <label>Choose an icon</label>

                <div className="collection-icon-picker">
                  {Object.entries(collectionIcons).map(([name, Icon]) => (
                    <button
                      type="button"
                      key={name}
                      className={
                        collectionForm.icon === name ? "selected" : ""
                      }
                      onClick={() =>
                        setCollectionForm((previous) => ({
                          ...previous,
                          icon: name,
                        }))
                      }
                      aria-label={`Choose ${name} icon`}
                    >
                      <Icon size={19} />
                    </button>
                  ))}
                </div>

                <label>Choose a colour</label>

                <div className="collection-color-picker">
                  {collectionColors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`collection-color-option ${color} ${
                        collectionForm.color === color ? "selected" : ""
                      }`}
                      onClick={() =>
                        setCollectionForm((previous) => ({
                          ...previous,
                          color,
                        }))
                      }
                      aria-label={`Choose ${color} colour`}
                    />
                  ))}
                </div>

                {collectionError && (
                  <p className="add-form-error">{collectionError}</p>
                )}

                <div className="add-modal-actions">
                  <button
                    type="button"
                    className="add-cancel-button"
                    onClick={() => setShowCollectionModal(false)}
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    className="add-submit-button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={savingCollection}
                  >
                    {savingCollection ? (
                      "Saving..."
                    ) : (
                      <>
                        <Check size={17} />
                        {editingCollection
                          ? "Save changes"
                          : "Create collection"}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------
          DELETE BOOKMARK CONFIRMATION
      -------------------------------------------------- */}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="add-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setDeleteTarget(null);
            }}
          >
            <motion.div
              className="delete-confirm-dialog"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              role="alertdialog"
              aria-modal="true"
            >
              <div className="delete-icon">
                <Trash2 size={25} />
              </div>

              <h2>Delete this bookmark?</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.title}</strong>? This action cannot be
                undone.
              </p>

              <div className="delete-confirm-actions">
                <button
                  className="add-cancel-button"
                  onClick={() => setDeleteTarget(null)}
                >
                  Keep bookmark
                </button>

                <motion.button
                  className="delete-confirm-button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmDelete}
                >
                  <Trash2 size={16} /> Delete bookmark
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------
          DELETE COLLECTION CONFIRMATION
      -------------------------------------------------- */}

      <AnimatePresence>
        {deleteCollectionTarget && (
          <motion.div
            className="add-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setDeleteCollectionTarget(null);
              }
            }}
          >
            <motion.div
              className="delete-confirm-dialog"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              role="alertdialog"
              aria-modal="true"
            >
              <div className="delete-icon">
                <Trash2 size={25} />
              </div>

              <h2>Delete this collection?</h2>

              <p>
                <strong>{deleteCollectionTarget.name}</strong> will be deleted,
                but the bookmarks inside it will remain in your library. Their
                other collection assignments will stay intact.
              </p>

              <div className="delete-confirm-actions">
                <button
                  className="add-cancel-button"
                  onClick={() => setDeleteCollectionTarget(null)}
                >
                  Keep collection
                </button>

                <motion.button
                  className="delete-confirm-button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmDeleteCollection}
                >
                  <Trash2 size={16} /> Delete collection
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}