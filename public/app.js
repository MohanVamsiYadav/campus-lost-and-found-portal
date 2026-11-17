
const API = "/api";

let token = localStorage.getItem("campusToken") || "";
let currentUser = JSON.parse(localStorage.getItem("campusUser") || "null");

const $ = (id) => document.getElementById(id);

const headers = () => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...headers(),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");

  setTimeout(() => {
    $("toast").classList.remove("show");
  }, 2600);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

// ================= AUTHENTICATION =================

function updateAuthUI() {
  $("authActions").innerHTML = currentUser
    ? `<span class="welcome">Hi, ${escapeHtml(currentUser.name)}</span>
       <button class="btn btn-outline" id="headerLogout">Logout</button>`
    : `<button class="btn btn-outline" id="loginOpen">Login</button>
       <button class="btn btn-primary" id="registerOpen">Sign up</button>`;

  $("loginOpen")?.addEventListener("click", () => openAuth("login"));
  $("registerOpen")?.addEventListener("click", () => openAuth("register"));
  $("headerLogout")?.addEventListener("click", logout);

  $("logoutBtn").classList.toggle("hidden", !currentUser);

  $("dashboardIntro").textContent = currentUser
    ? `Signed in as ${currentUser.email}${currentUser.role === "admin" ? " · Administrator" : ""}`
    : "Log in to manage your reports and claims.";

  $("adminPanel").classList.toggle("hidden", currentUser?.role !== "admin");
}

function openAuth(mode) {
  $("authModal").classList.remove("hidden");

  $("authTitle").textContent =
    mode === "login" ? "Welcome back" : "Create your account";

  $("authSubmit").textContent =
    mode === "login" ? "Login" : "Create account";

  $("nameWrap").classList.toggle("hidden", mode === "login");
  $("nameWrap").querySelector("input").required = mode === "register";

  $("authForm").dataset.mode = mode;
  $("authMessage").textContent = "";

  $("switchAuth").innerHTML = mode === "login"
    ? `New here? <a href="#">Create an account</a>`
    : `Already registered? <a href="#">Login</a>`;
}

$("loginOpen")?.addEventListener("click", () => openAuth("login"));
$("registerOpen")?.addEventListener("click", () => openAuth("register"));

$("modalClose").addEventListener("click", () => {
  $("authModal").classList.add("hidden");
});

$("switchAuth").addEventListener("click", e => {
  if (e.target.tagName === "A") {
    e.preventDefault();

    openAuth(
      $("authForm").dataset.mode === "login" ? "register" : "login"
    );
  }
});

$("authForm").addEventListener("submit", async e => {
  e.preventDefault();

  const form = new FormData(e.target);
  const mode = e.target.dataset.mode;
  const body = Object.fromEntries(form.entries());

  try {
    const data = await api(`/auth/${mode}`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    if (mode === "login") {
      token = data.token;
      currentUser = data.user;

      localStorage.setItem("campusToken", token);
      localStorage.setItem("campusUser", JSON.stringify(currentUser));
    } else {
      toast("Account created. Please log in.");
      openAuth("login");
      return;
    }

    $("authModal").classList.add("hidden");

    updateAuthUI();
    await loadDashboard();

    toast("Login successful");

    await loadItems();

  } catch (err) {
    $("authMessage").textContent = err.message;
  }
});

function logout() {
  token = "";
  currentUser = null;

  localStorage.removeItem("campusToken");
  localStorage.removeItem("campusUser");

  updateAuthUI();
  loadDashboard();
  loadItems();

  toast("Logged out");
}

$("logoutBtn").addEventListener("click", logout);

// ================= ITEMS AND SEARCH =================

async function loadItems() {
  const params = new URLSearchParams();

  [
    ["q", "searchInput"],
    ["category", "categoryFilter"],
    ["location", "locationFilter"],
    ["type", "typeFilter"],
    ["sort", "sortFilter"]
  ].forEach(([key, id]) => {
    if ($(id).value) {
      params.set(key, $(id).value);
    }
  });

  try {
    const data = await api(`/items?${params.toString()}`);

    $("itemGrid").innerHTML = data.items.length
      ? data.items.map(item => `
          <article class="item-card">

            <div class="item-top">
              <span class="pill ${escapeHtml(item.type)}">
                ${escapeHtml(item.type)}
              </span>

              <span class="muted">
                ${escapeHtml(item.category)}
              </span>
            </div>

            <h3>${escapeHtml(item.title)}</h3>

            <p>${escapeHtml(item.description)}</p>

            <div class="item-meta">
              <span>📍 ${escapeHtml(item.location)}</span>

              <span>📅 ${new Date(item.itemDate).toLocaleDateString()}</span>
            </div>

            <button
              class="btn btn-outline claim-btn"
              data-id="${escapeHtml(item._id)}">
              I can identify this
            </button>

          </article>
        `).join("")
      : `<div class="empty">No matching reports. Try changing your search.</div>`;

    $("totalCount").textContent = data.count;

    $("lostCount").textContent =
      data.items.filter(i => i.type === "lost").length;

    $("foundCount").textContent =
      data.items.filter(i => i.type === "found").length;

    document.querySelectorAll(".claim-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        submitClaim(btn.dataset.id);
      });
    });

  } catch (err) {
    $("itemGrid").innerHTML = `
      <div class="empty">
        ${escapeHtml(err.message)}. Is the server running?
      </div>
    `;
  }
}

async function submitClaim(itemId) {
  if (!token) {
    return openAuth("login");
  }

  const message = prompt(
    "Describe a detail that proves this item belongs to you:"
  );

  if (!message) return;

  try {
    await api("/claims", {
      method: "POST",
      body: JSON.stringify({ itemId, message })
    });

    toast("Claim submitted for review");

    await loadDashboard();

  } catch (err) {
    toast(err.message);
  }
}

// Search and filter buttons

$("searchBtn").addEventListener("click", loadItems);
$("refreshBtn").addEventListener("click", loadItems);

$("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    loadItems();
  }
});

$("sortFilter").addEventListener("change", loadItems);
$("typeFilter").addEventListener("change", loadItems);
$("categoryFilter").addEventListener("change", loadItems);
$("locationFilter").addEventListener("change", loadItems);

// ================= CREATE ITEM REPORT =================

$("itemForm").addEventListener("submit", async e => {
  e.preventDefault();

  if (!token) {
    return openAuth("login");
  }

  const body = Object.fromEntries(
    new FormData(e.target).entries()
  );

  try {
    await api("/items", {
      method: "POST",
      body: JSON.stringify(body)
    });

    e.target.reset();

    $("itemMessage").textContent =
      "Your report has been submitted.";

    await loadItems();
    await loadDashboard();

    toast("Item report created");

  } catch (err) {
    $("itemMessage").textContent = err.message;
  }
});

// ================= STUDENT DASHBOARD =================

async function loadDashboard() {
  if (!token) {
    $("myListings").textContent =
      "Sign in to view your listings.";

    $("myClaims").textContent =
      "Sign in to view your claims.";

    return;
  }

  try {
    const [items, claims] = await Promise.all([
      api("/items/my"),
      api("/claims/mine")
    ]);

    const mine = items.items;

    $("myListings").innerHTML = mine.length
      ? mine.map(i => `
          <div class="compact-row">
            <b>${escapeHtml(i.title)}</b>
            · ${escapeHtml(i.type)}
            · ${escapeHtml(i.status)}
          </div>
        `).join("")
      : "You have not posted any items yet.";

    $("myClaims").innerHTML = claims.claims.length
      ? claims.claims.map(c => `
          <div class="compact-row">
            <b>${escapeHtml(c.item?.title || "Item")}</b>
            · ${escapeHtml(c.status)}
          </div>
        `).join("")
      : "You have not submitted any claims.";

    if (currentUser?.role === "admin") {
      await loadAdmin();
    }

  } catch (err) {
    $("myListings").textContent = err.message;
  }
}

// ================= ADMIN DASHBOARD =================

async function loadAdmin() {
  const [stats, claims] = await Promise.all([
    api("/admin/stats"),
    api("/admin/claims")
  ]);

  $("adminStats").innerHTML = Object.entries(stats)
    .map(([k, v]) => `
      <div>
        <strong>${escapeHtml(v)}</strong>
        <span>${escapeHtml(k.replace(/[A-Z]/g, " $&"))}</span>
      </div>
    `).join("");

  $("adminClaims").innerHTML = claims.claims.length
    ? claims.claims.map(c => `
        <div class="claim-row">

          <span>
            <b>${escapeHtml(c.item?.title || "Item")}</b>
            <br>
            ${escapeHtml(c.claimant?.name || "Student")}
            · ${escapeHtml(c.status)}
          </span>

          ${c.status === "pending"
        ? `
                <span>
                  <button
                    class="btn btn-primary"
                    data-claim="${escapeHtml(c._id)}"
                    data-status="approved">
                    Approve
                  </button>

                  <button
                    class="btn btn-outline"
                    data-claim="${escapeHtml(c._id)}"
                    data-status="rejected">
                    Reject
                  </button>
                </span>
              `
        : ""
      }

        </div>
      `).join("")
    : "No claims yet.";

  document.querySelectorAll("[data-claim]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await api(`/admin/claims/${btn.dataset.claim}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: btn.dataset.status
          })
        });

        toast(`Claim ${btn.dataset.status}`);

        await loadAdmin();

      } catch (err) {
        toast(err.message);
      }
    });
  });
}

// ================= INITIAL LOAD =================

updateAuthUI();
loadItems();
loadDashboard();
