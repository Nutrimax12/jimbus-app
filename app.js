const STORAGE_KEY = "jimbus_contacts_v1";
let contacts = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const $ = id => document.getElementById(id);

function render() {
  const search = $("searchInput").value.trim().toLowerCase();
  const type = $("typeFilter").value;

  const filtered = contacts.filter(c => {
    const matchesSearch =
      !search ||
      Object.values(c).some(v =>
        String(v || "").toLowerCase().includes(search)
      );

    const matchesType =
      !type || c.contactType === type;

    return matchesSearch && matchesType;
  });

  $("clientCount").textContent =
    contacts.filter(c => c.contactType === "Cliente").length;

  $("prospectCount").textContent =
    contacts.filter(c => c.contactType === "Prospecto").length;

  $("followupCount").textContent =
    contacts.filter(c => c.nextFollowup).length;

  $("emptyState").style.display =
    contacts.length === 0 ? "block" : "none";

  $("contactList").innerHTML = filtered.map(contactCard).join("");
}

function contactCard(c) {
  return `
    <article class="contact-card">

      <span class="type-badge">
        ${c.contactType}
      </span>

      <h3>${escapeHtml(c.businessName)}</h3>

      <p><strong>Contacto:</strong> ${escapeHtml(c.contactName)}</p>
      <p><strong>Teléfono:</strong> ${escapeHtml(c.phone)}</p>

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
        c.nextFollowup
          ? `<p><strong>Próximo seguimiento:</strong> ${escapeHtml(c.nextFollowup)}</p>`
          : ""
      }

      ${
        c.notes
          ? `<p><strong>Nota:</strong> ${escapeHtml(c.notes)}</p>`
          : ""
      }

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
  $("nextFollowup").value = contact?.nextFollowup || "";
  $("notes").value = contact?.notes || "";

  $("contactModal").classList.remove("hidden");
}

function closeModal() {
  $("contactModal").classList.add("hidden");
  $("contactForm").reset();
  $("contactId").value = "";
}

$("contactForm").addEventListener("submit", e => {
  e.preventDefault();

  const id =
    $("contactId").value ||
    crypto.randomUUID();

  const contact = {
    id,
    businessName: $("businessName").value.trim(),
    contactName: $("contactName").value.trim(),
    phone: $("phone").value.trim(),
    city: $("city").value.trim(),
    zone: $("zone").value.trim(),
    contactType: $("contactType").value,
    nextFollowup: $("nextFollowup").value,
    notes: $("notes").value.trim()
  };

  const index =
    contacts.findIndex(c => c.id === id);

  if (index >= 0) {
    contacts[index] = contact;
  } else {
    contacts.unshift(contact);
  }


localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));



  closeModal();
  render();
});

function editContact(id) {
  const contact =
    contacts.find(c => c.id === id);

  if (contact) openModal(contact);
}

function deleteContact(id) {
  const contact =
    contacts.find(c => c.id === id);

  if (!contact) return;

  if (!confirm(`¿Eliminar a ${contact.businessName}?`)) {
    return;
  }

  contacts =
    contacts.filter(c => c.id !== id); 
localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));

  render();
}

function callContact(id) {
  const contact =
    contacts.find(c => c.id === id);

  if (!contact) return;

  window.location.href =
    "tel:" +
    contact.phone.replace(/[^\d+]/g, "");
}

function whatsappContact(id) {
  const contact =
    contacts.find(c => c.id === id);

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
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

$("newContactBtn").onclick =
  () => openModal();

$("emptyNewBtn").onclick =
  () => openModal();

$("closeModalBtn").onclick =
  closeModal;

$("searchInput").oninput =
  render;

$("typeFilter").onchange =
  render;

$("logoutBtn").onclick =
  () => alert("El cierre de sesión se conectará a Supabase.");

$("contactModal").addEventListener(
  "click",
  e => {
    if (e.target === $("contactModal")) {
      closeModal();
    }
  }
);

render();