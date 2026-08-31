(async () => {
  const SUPABASE_URL = "https://fajnnxahxxtnmjvhyqej.supabase.co";
  const SUPABASE_KEY = "sb_publishable_3upfkXAjSy2gYE6BqVaWhQ_tu_3lfcX";

  const { createClient } = await import(
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
  );

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  let contacts = [];
  let currentUser = null;

  const $ = id => document.getElementById(id);

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function dbToContact(row) {
    return {
      id: String(row.id),
      businessName: row.negocio || "",
      contactName: row.encargado || "",
      phone: row.telefono || "",
      address: row.direccion || "",
      city: row.ciudad || "",
      zone: row.barrio || "",
      contactType: row.tipo || "Cliente",
      nextFollowup: row.proximo_seguimiento || "",
      notes: row.notas || "",
      commercialStatus: row.estado_comercial || "Nuevo"
    };
  }

  function showAuthScreen() {
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#f5f7fb;
        padding:24px;
        font-family:Arial,sans-serif;
      ">
        <div style="
          background:white;
          width:100%;
          max-width:420px;
          padding:32px;
          border-radius:18px;
          box-shadow:0 12px 35px rgba(0,0,0,.08);
        ">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
            <div style="
              width:48px;height:48px;border-radius:14px;
              background:#111827;color:white;
              display:flex;align-items:center;justify-content:center;
              font-weight:700;font-size:24px;
            ">J</div>
            <div>
              <h2 style="margin:0;">JIMBUS</h2>
              <p style="margin:4px 0 0;color:#6b7280;">Clientes y prospectos</p>
            </div>
          </div>

          <h2 style="margin-bottom:8px;">Bienvenido a JIMBUS</h2>
          <p style="color:#6b7280;margin-top:0;">
            Ingresa a tu cuenta para administrar tus contactos.
          </p>

          <form id="loginForm">
            <label style="display:block;margin-top:20px;font-weight:600;">
              Correo electrónico
            </label>
            <input
              id="loginEmail"
              type="email"
              required
              style="
                width:100%;box-sizing:border-box;padding:13px;
                margin-top:7px;border:1px solid #d1d5db;
                border-radius:10px;font-size:16px;
              "
            >

            <label style="display:block;margin-top:16px;font-weight:600;">
              Contraseña
            </label>
            <input
              id="loginPassword"
              type="password"
              required
              minlength="6"
              style="
                width:100%;box-sizing:border-box;padding:13px;
                margin-top:7px;border:1px solid #d1d5db;
                border-radius:10px;font-size:16px;
              "
            >

            <button
              type="submit"
              style="
                width:100%;margin-top:22px;padding:14px;
                border:0;border-radius:10px;background:#111827;
                color:white;font-weight:700;font-size:16px;cursor:pointer;
              "
            >
              Iniciar sesión
            </button>
          </form>

          <button
            id="createAccountBtn"
            style="
              width:100%;margin-top:12px;padding:13px;
              border:1px solid #d1d5db;border-radius:10px;
              background:white;font-weight:600;cursor:pointer;
            "
          >
            Crear cuenta
          </button>

          <p id="authMessage" style="
            color:#b91c1c;
            margin-top:16px;
            text-align:center;
            min-height:20px;
          "></p>
        </div>
      </div>
    `;

    $("loginForm").addEventListener("submit", async e => {
      e.preventDefault();

      $("authMessage").textContent = "Ingresando...";

      const email = $("loginEmail").value.trim();
      const password = $("loginPassword").value;

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

if (error) {
  $("#authMessage").textContent =
    "No se pudo iniciar sesión: " + error.message;
  return;
}

// Verificar estado y plan del usuario en JIMBUS
const user = data.user;

const { data: perfil, error: perfilError } = await supabase
  .from("jimbus_usuarios")
  .select("plan, estado, fecha_vencimiento")
  .eq("usuario_id", user.id)
  .single();

if (perfilError || !perfil) {
  await supabase.auth.signOut();
  $("#authMessage").textContent =
    "Tu cuenta no está habilitada en JIMBUS.";
  return;
}

if (perfil.estado !== "activo") {
  await supabase.auth.signOut();
  showAuthScreen();
  $("#authMessage").textContent =
    "Tu cuenta está bloqueada. Contacta a JIMBUS.";
  return;
}
if (
  perfil.fecha_vencimiento &&
  new Date(perfil.fecha_vencimiento + "T23:59:59") < new Date()
) {
  await supabase.auth.signOut();
  $("#authMessage").textContent =
    "Tu suscripción ha vencido. Contacta a JIMBUS.";
  return;
}

location.reload();


      
    });

    $("createAccountBtn").onclick = async () => {
      const email = $("loginEmail").value.trim();
      const password = $("loginPassword").value;

      if (!email || password.length < 6) {
        $("authMessage").textContent =
          "Escribe un correo válido y una contraseña de mínimo 6 caracteres.";
        return;
      }

      $("authMessage").textContent = "Creando cuenta...";

      const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: "https://nutrimax12.github.io/jimbus-app/"
  }
});

      if (error) {
        $("authMessage").textContent =
          "No se pudo crear la cuenta: " + error.message;
        return;
      }

      if (!data.session) {
        $("authMessage").style.color = "#166534";
        $("authMessage").textContent =
          "Cuenta creada. Revisa tu correo para confirmar el registro.";
      } else {
        location.reload();
      }
    }
  }

  async function loadContacts() {
    const { data, error } = await supabase
  .from("jimbus_contactos")
  .select("*")
  .eq("usuario_id", currentUser.id)
  .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("No se pudieron cargar los contactos: " + error.message);
      return;
    }

    contacts = (data || []).map(dbToContact);
    render();
  }

  function render() {
    const search = $("searchInput").value.trim().toLowerCase();
    const type = $("typeFilter").value;

    const today = new Date().toISOString().split("T")[0];

const filtered = contacts.filter(c => {
  const matchesSearch =
    !search ||
    Object.values(c).some(v =>
      String(v || "").toLowerCase().includes(search)
    );

const matchesType =
  !type || c.contactType === type;

const matchesFollowup =
  !window.showPendingFollowups ||
  c.nextFollowup === today;


  return matchesSearch && matchesType && matchesFollowup;
});
      

    $("clientCount").textContent =
      contacts.filter(c => c.contactType === "Cliente").length;

    $("prospectCount").textContent =
      contacts.filter(c => c.contactType === "Prospecto").length;

$("followupCount").textContent =
  contacts.filter(c => c.nextFollowup === today).length;

    $("emptyState").style.display =
      contacts.length === 0 ? "block" : "none";

    $("contactList").innerHTML =
      filtered.map(contactCard).join("");
  }

  function contactCard(c) {

 const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "America/Bogota"
});
const followupStatus =
  !c.nextFollowup
    ? ""
    : c.nextFollowup < today
      ? "VENCIDO"
      : c.nextFollowup === today
        ? "HOY"
        : "";
    return `
     <article class="contact-card card-${(c.commercialStatus || "Nuevo").toLowerCase()}">
        <span class="type-badge">${escapeHtml(c.contactType)}</span>

        <h3>${escapeHtml(c.businessName)}</h3>

        <p>
          <strong>Contacto:</strong>
          ${escapeHtml(c.contactName)}
        </p>

        <p>
          <strong>Teléfono:</strong>
          ${escapeHtml(c.phone)}
        </p>
        ${
  c.address
    ? `<p><strong>Dirección:</strong> ${escapeHtml(c.address)}</p>`
    : ""
}

        ${
          c.city
            ? `<p><strong>Ciudad:</strong> ${escapeHtml(c.city)}</p>`
            : ""
        }

        ${
          c.zone
            ? `<p><strong>Zona:</strong> ${escapeHtml(c.zone)}</p>`
            : ""
        }

        ${
  c.commercialStatus
    ? `<p>
        <strong>Estado comercial:</strong>
        <span class="status-badge status-${c.commercialStatus.toLowerCase()}">
          ${
            c.commercialStatus === "Nuevo" ? "🆕" :
            c.commercialStatus === "Contactado" ? "📞" :
            c.commercialStatus === "Interesado" ? "🔥" :
            c.commercialStatus === "Cliente" ? "✅" : ""
          }
          ${escapeHtml(c.commercialStatus)}
        </span>
      </p>`
    : ""
}
${c.nextFollowup ? `
<p>
  <strong>Próximo seguimiento:</strong>
  ${escapeHtml(c.nextFollowup)}
  ${followupStatus ? `<strong> — ${followupStatus}</strong>` : ""}
</p>
` : ""}

${c.notes ? `
<div class="followup-history">
  <strong>Historial de seguimiento:</strong>

  ${escapeHtml(c.notes)
    .split("\n")
    .filter(line => line.trim())
    .slice(0, 3)
    .map(line => `<div class="followup-history-item">${line}</div>`)
    .join("")}

  ${
    c.notes.split("\n").filter(line => line.trim()).length > 3
      ? `<details class="followup-more">
          <summary>
            Ver historial completo (${c.notes.split("\n").filter(line => line.trim()).length})
          </summary>

          ${escapeHtml(c.notes)
            .split("\n")
            .filter(line => line.trim())
            .slice(3)
            .map(line => `<div class="followup-history-item">${line}</div>`)
            .join("")}
        </details>`
      : ""
  }
</div>
` : ""}

       

        <div class="contact-actions">
          <button
            class="small-button"
            onclick="callContact('${c.id}')">
            ☎ Llamar
          </button>

          <button
            class="small-button whatsapp-button"
            onclick="whatsappContact('${c.id}')">
            💬 WhatsApp
          </button>
          ${c.nextFollowup ? `
  <button
    class="small-button"
    onclick="completeFollowup('${c.id}')">
    ✓ Realizado
  </button>
` : ""}

          <button
            class="small-button"
            onclick="editContact('${c.id}')">
            ✎ Editar
          </button>

          <button
            class="small-button"
            onclick="deleteContact('${c.id}')">
            Eliminar
          </button>
        </div>
      </article>
    `;
  }

  function openModal(contact = null) {
    $("modalTitle").textContent =
      contact ? "Editar contacto" : "Nuevo contacto";

    $("contactId").value = contact?.id || "";
    $("businessName").value = contact?.businessName || "";
    $("contactName").value = contact?.contactName || "";
    $("phone").value = contact?.phone || "";
    $("city").value = contact?.city || "";
    $("zone").value = contact?.zone || "";
    $("contactType").value = contact?.contactType || "Cliente";
    $("commercialStatus").value = contact?.commercialStatus || "Nuevo";
    $("nextFollowup").value = contact?.nextFollowup || "";
    $("notes").value = "";

    $("contactModal").classList.remove("hidden");
  }

  function closeModal() {
    $("contactModal").classList.add("hidden");
    $("contactForm").reset();
    $("contactId").value = "";
  }

  async function saveContact(e) {
    e.preventDefault();
    const id = $("contactId").value;

    const currentContact = id
  ? contacts.find(c => c.id === String(id))
  : null;

const noteText = $("notes").value.trim().replace(/\s*\n+\s*/g, " ");
const today = new Date().toLocaleDateString("es-CO");
const newNote = noteText ? `${today} — ${noteText}` : "";

let finalNotes = newNote || null;

if (currentContact && currentContact.notes) {
  const oldNotes = currentContact.notes.trim();

  if (newNote) {
    finalNotes = newNote + "\n" + oldNotes;
  } else {
    finalNotes = oldNotes;
  }
}
    const payload = {
      negocio: $("businessName").value.trim(),
      encargado: $("contactName").value.trim(),
      telefono: $("phone").value.trim(),
      direccion: $("address").value.trim() || null,
      ciudad: $("city").value.trim() || null,
      barrio: $("zone").value.trim() || null,
      tipo: $("contactType").value,
      proximo_seguimiento: $("nextFollowup").value || null,
      notas: finalNotes,
   estado_comercial: document.getElementById("commercialStatus").value
    };

    let error;

    if (id) {
      const result = await supabase
        .from("jimbus_contactos")
        .update(payload)
        .eq("id", id);

      error = result.error;
    } else {
      payload.usuario_id = currentUser.id;

      const result = await supabase
        .from("jimbus_contactos")
        .insert(payload);

      error = result.error;
    }

    if (error) {
      console.error(error);
      alert("No se pudo guardar: " + error.message);
      return;
    }

    closeModal();
    await loadContacts();
  }

  window.editContact = function(id) {
    const contact = contacts.find(c => c.id === String(id));
    if (contact) openModal(contact);
  };

  window.deleteContact = async function(id) {
    const contact = contacts.find(c => c.id === String(id));

    if (!contact) return;

    if (!confirm(`¿Eliminar a ${contact.businessName}?`)) {
      return;
    }

    const { error } = await supabase
      .from("jimbus_contactos")
      .delete()
      .eq("id", id);

    if (error) {
      alert("No se pudo eliminar: " + error.message);
      return;
    }

    await loadContacts();
  }; 
 window.completeFollowup = async function(id) {
  const contact = contacts.find(c => c.id === String(id));

  if (!contact) return;

  const today = new Date().toLocaleDateString("es-CO");

  const oldNote = contact.notes ? contact.notes.trim() : "";

  const completedNote = oldNote
    ? `✓ ${today} — ${oldNote}`
    : `✓ ${today} — Seguimiento realizado`;

  const { error } = await supabase
    .from("jimbus_contactos")
    .update({
      proximo_seguimiento: null,
      notas: completedNote
    })
    .eq("id", id)
    .eq("usuario_id", currentUser.id);

  if (error) {
    alert("No se pudo marcar el seguimiento como realizado: " + error.message);
    return;
  }

  await loadContacts();
};

  window.callContact = function(id) {
    const contact = contacts.find(c => c.id === String(id));
    if (!contact) return;

    window.location.href =
      "tel:" + contact.phone.replace(/[^\d+]/g, "");
  };

  window.whatsappContact = function(id) {
    const contact = contacts.find(c => c.id === String(id));
    if (!contact) return;

    let phone =
      (contact.phone || "").replace(/\D/g, "");

    if (phone.length === 10) {
      phone = "57" + phone;
    }

    window.open(
      "https://wa.me/" + phone,
      "_blank"
    );
  };

  const {
  data: { session }
} = await supabase.auth.getSession();

if (!session) {
  showAuthScreen();
  return;
}

const user = session.user;

const { data: perfil, error: perfilError } = await supabase
  .from("jimbus_usuarios")
  .select("plan, estado, fecha_vencimiento")
  .eq("usuario_id", user.id)
  .single();

if (perfilError || !perfil) {
  await supabase.auth.signOut();
  showAuthScreen();
  return;
}

if (perfil.estado !== "activo") {
  await supabase.auth.signOut();
  showAuthScreen();
  alert("Tu cuenta está bloqueada. Contacta a JIMBUS.");
  return;
}

if (
  perfil.fecha_vencimiento &&
  new Date(perfil.fecha_vencimiento + "T23:59:59") < new Date()
) {
  await supabase.auth.signOut();
  showAuthScreen();
  alert("Tu suscripción ha vencido. Contacta a JIMBUS.");
  return;
}

currentUser = user;

  $("newContactBtn").onclick = () => openModal();
  $("emptyNewBtn").onclick = () => openModal();
  $("closeModalBtn").onclick = closeModal;
  $("searchInput").oninput = render;
  $("typeFilter").onchange = render;
  $("contactForm").addEventListener("submit", saveContact);

  $("logoutBtn").onclick = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("No se pudo cerrar la sesión: " + error.message);
      return;
    }

    location.reload();
  };

 window.showPendingFollowups = false;

const followupCard = $("followupCount").closest(".stat-card");
const clientCard = $("clientCount").closest(".stat-card");
const prospectCard = $("prospectCount").closest(".stat-card");

function clearStatSelection() {
  [clientCard, prospectCard, followupCard].forEach(card => {
    if (!card) return;
    card.style.outline = "none";
    card.style.background = "";
  });
}

if (followupCard) {
  followupCard.style.cursor = "pointer";

  followupCard.onclick = () => {
    $("typeFilter").value = "";
    window.showPendingFollowups = true;

    clearStatSelection();

    followupCard.style.outline = "2px solid #111827";
    followupCard.style.background = "#f3f4f6";

    render();
  };
}

if (clientCard) {
  clientCard.style.cursor = "pointer";

  clientCard.onclick = () => {
    $("typeFilter").value = "Cliente";
    window.showPendingFollowups = false;

    clearStatSelection();

    clientCard.style.outline = "2px solid #111827";
    clientCard.style.background = "#e5e7eb";

    render();
  };
}

if (prospectCard) {
  prospectCard.style.cursor = "pointer";

  prospectCard.onclick = () => {
    $("typeFilter").value = "Prospecto";
    window.showPendingFollowups = false;

    clearStatSelection();

    prospectCard.style.outline = "2px solid #111827";
    prospectCard.style.background = "#e5e7eb";

    render();
  };
}

    

  await loadContacts();
})();
