/* Demande de formation : envoi par WhatsApp, budget verrouillé après la première demande.
   Le verrou est enregistré dans le navigateur de la personne (localStorage), et le message
   WhatsApp indique le budget comme définitif : Kevin voit le numéro et refuse tout changement. */
(function () {
  var WHATSAPP = "33641478339";
  var KEY = "kevin_formation_demande_v1";

  var form = document.getElementById("f-form");
  var locked = document.getElementById("f-locked");
  var error = document.getElementById("f-error");
  if (!form || !locked) return;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* stockage indisponible : le message WhatsApp fait foi */ }
  }
  function message(d) {
    return "Bonjour Kevin, je souhaite suivre ta formation pour apprendre à créer des sites.\n\n" +
      "Prénom : " + d.prenom + "\n" +
      "Niveau : " + d.niveau + "\n" +
      "Objectif : " + d.objectif + "\n" +
      "Budget choisi : " + d.budget + " (choix définitif)\n" +
      "Demande faite le " + d.date + ".";
  }
  function waUrl(d) { return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message(d)); }

  function showLocked(d) {
    // Le budget enregistré reste coché, et plus aucun budget ne peut être choisi.
    form.querySelectorAll('input[name="budget"]').forEach(function (r) {
      r.checked = r.value === d.budget;
      r.disabled = true;
    });
    form.classList.add("is-locked");
    document.getElementById("f-l-prenom").textContent = d.prenom;
    document.getElementById("f-l-budget").textContent = d.budget;
    document.getElementById("f-l-date").textContent = d.date;
    document.getElementById("f-resend").href = waUrl(d);
    locked.hidden = false;
  }

  var existing = load();
  if (existing && existing.budget) showLocked(existing);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var prev = load();
    if (prev && prev.budget) { showLocked(prev); return; }

    var fd = new FormData(form);
    var d = {
      prenom: (fd.get("prenom") || "").toString().trim(),
      niveau: (fd.get("niveau") || "").toString(),
      objectif: (fd.get("objectif") || "").toString(),
      budget: (fd.get("budget") || "").toString(),
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    };
    if (!d.prenom || !d.niveau || !d.objectif || !d.budget) {
      error.textContent = "Merci de remplir votre prénom, votre niveau, votre objectif et votre budget.";
      error.hidden = false;
      return;
    }
    error.hidden = true;
    save(d);
    showLocked(d);
    window.open(waUrl(d), "_blank", "noopener");
  });
})();
