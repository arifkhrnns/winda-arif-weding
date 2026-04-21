    const SUPABASE_URL = "https://kiwedazhuwchqnsjtvrp.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_d8Kuy72deaMNF30auU1I9A_z2tsMG4i";
    const SUPABASE_WISHES_TABLE = "wishes";
    const wishesEnabled =
      !SUPABASE_URL.includes("YOUR_") &&
      !SUPABASE_ANON_KEY.includes("YOUR_");
    const targetDate = new Date("2026-07-05T08:00:00+07:00").getTime();
    const countdownIds = {
      days: document.getElementById("days"),
      hours: document.getElementById("hours"),
      minutes: document.getElementById("minutes"),
      seconds: document.getElementById("seconds")
    };

    function updateCountdown() {
      const now = Date.now();
      const diff = Math.max(targetDate - now, 0);

      const day = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hour = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minute = Math.floor((diff / (1000 * 60)) % 60);
      const second = Math.floor((diff / 1000) % 60);

      countdownIds.days.textContent = String(day).padStart(2, "0");
      countdownIds.hours.textContent = String(hour).padStart(2, "0");
      countdownIds.minutes.textContent = String(minute).padStart(2, "0");
      countdownIds.seconds.textContent = String(second).padStart(2, "0");
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.18 });

    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

    const overlay = document.getElementById("invitationCover");
    const openButton = document.getElementById("openInvitation");
    const body = document.body;
    const bgMusic = document.getElementById("bgMusic");
    const audioToggle = document.getElementById("audioToggle");

    async function playAudio() {
      try {
        bgMusic.volume = 0.35;
        await bgMusic.play();
      } catch (error) {
        audioToggle.textContent = "♫";
      }
    }

    openButton.addEventListener("click", async () => {
      overlay.classList.add("is-hidden");
      body.classList.remove("locked");
      await playAudio();
    });

    audioToggle.addEventListener("click", async () => {
      if (bgMusic.paused) {
        await playAudio();
        audioToggle.textContent = "♪";
      } else {
        bgMusic.pause();
        audioToggle.textContent = "♫";
      }
    });

    const sessionConfig = {
      "1": {
        label: "Resepsi Sesi 1",
        time: "Minggu, 5 Juli 2026<br />11.00 WIB - 13.00 WIB",
        note: "Undangan ini berlaku untuk resepsi sesi 1. Mohon hadir sesuai sesi yang tertera pada undangan.",
        intro: "Sebuah selebrasi hangat bersama keluarga, sahabat, dan orang terkasih pada sesi pertama resepsi kami."
      },
      "2": {
        label: "Resepsi Sesi 2",
        time: "Minggu, 5 Juli 2026<br />13.30 WIB - 15.30 WIB",
        note: "Undangan ini berlaku untuk resepsi sesi 2. Mohon hadir sesuai sesi yang tertera pada undangan.",
        intro: "Sebuah selebrasi hangat bersama keluarga, sahabat, dan orang terkasih pada sesi kedua resepsi kami."
      }
    };

    const params = new URLSearchParams(window.location.search);
    const guest = params.get("to");
    const session = params.get("sesi");
    const activeSession = sessionConfig[session] || sessionConfig["1"];

    document.getElementById("sessionPill").textContent = activeSession.label;
    document.getElementById("receptionTime").innerHTML = activeSession.time;
    document.getElementById("sessionNote").textContent = activeSession.note;
    document.getElementById("receptionIntro").textContent = activeSession.intro;

    if (guest) {
      const cleanGuestName = guest.replace(/\+/g, " ").trim();
      document.getElementById("guestName").textContent = cleanGuestName || "Bapak/Ibu/Saudara/i";
      const nameField = document.getElementById("name");
      nameField.value = cleanGuestName;
    }

    document.getElementById("rsvpForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const summary = [
        "Halo, saya ingin konfirmasi kehadiran untuk undangan Winda & Arif.",
        "",
        "Nama: " + form.get("name"),
        "Sesi: " + activeSession.label,
        "Kehadiran: " + form.get("attendance"),
        "Jumlah tamu: " + form.get("guestCount"),
        "Ucapan: " + (form.get("message") || "-")
      ].join("\n");
      const whatsappUrl = "https://wa.me/6289688225295?text=" + encodeURIComponent(summary);
      window.open(whatsappUrl, "_blank");
      event.currentTarget.reset();
    });

    const wishForm = document.getElementById("wishForm");
    const wishItems = document.getElementById("wishItems");
    const wishStatus = document.getElementById("wishStatus");
    const wishSubmitButton = wishForm.querySelector('button[type="submit"]');

    function renderWishItem(wish) {
      const item = document.createElement("div");
      item.className = "wish-item";

      const title = document.createElement("strong");
      title.textContent = wish.name;

      const body = document.createElement("p");
      body.textContent = wish.message;

      item.append(title, body);
      return item;
    }

    function setWishStatus(message) {
      wishStatus.textContent = message;
      wishStatus.hidden = !message;
    }

    async function fetchWishes() {
      if (!wishesEnabled) {
        setWishStatus("Ucapan akan tampil di sini setelah Supabase dihubungkan.");
        return;
      }

      setWishStatus("Memuat ucapan tamu...");

      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/${SUPABASE_WISHES_TABLE}?select=id,name,message,created_at&order=created_at.desc&limit=20`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Gagal memuat ucapan dari Supabase.");
        }

        const wishes = await response.json();
        wishItems.innerHTML = "";

        if (!wishes.length) {
          setWishStatus("Belum ada ucapan. Jadilah yang pertama mengirim doa terbaik.");
          return;
        }

        wishes.forEach((wish) => {
          wishItems.appendChild(renderWishItem(wish));
        });
        setWishStatus("");
      } catch (error) {
        console.error(error);
        setWishStatus("Ucapan belum bisa dimuat. Periksa konfigurasi Supabase Anda.");
      }
    }

    wishForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const wishName = document.getElementById("wishName").value.trim();
      const wishText = document.getElementById("wishText").value.trim();

      if (!wishName || !wishText) {
        setWishStatus("Nama dan ucapan wajib diisi.");
        return;
      }

      if (!wishesEnabled) {
        setWishStatus("Isi konfigurasi Supabase terlebih dahulu untuk mengaktifkan ucapan tamu.");
        return;
      }

      wishSubmitButton.disabled = true;
      setWishStatus("Mengirim ucapan...");

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_WISHES_TABLE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            name: wishName,
            message: wishText
          })
        });

        if (!response.ok) {
          throw new Error("Gagal menyimpan ucapan ke Supabase.");
        }

        wishForm.reset();
        await fetchWishes();
        setWishStatus("Ucapan berhasil dikirim. Terima kasih atas doa terbaiknya.");
      } catch (error) {
        console.error(error);
        setWishStatus("Ucapan belum berhasil dikirim. Coba lagi beberapa saat lagi.");
      } finally {
        wishSubmitButton.disabled = false;
      }
    });

    const galleryItems = Array.from(document.querySelectorAll(".gallery-grid .gallery-item img"));
    const lightbox = document.getElementById("galleryLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCounter = document.getElementById("lightboxCounter");
    const lightboxClose = document.getElementById("lightboxClose");
    const lightboxPrev = document.getElementById("lightboxPrev");
    const lightboxNext = document.getElementById("lightboxNext");
    let activeGalleryIndex = 0;

    function renderLightbox(index) {
      const total = galleryItems.length;
      activeGalleryIndex = (index + total) % total;
      const activeImage = galleryItems[activeGalleryIndex];
      lightboxImage.src = activeImage.src;
      lightboxImage.alt = activeImage.alt;
      lightboxCounter.textContent = `${activeGalleryIndex + 1} / ${total}`;
    }

    function openLightbox(index) {
      renderLightbox(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("viewer-open");
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("viewer-open");
      lightboxImage.src = "";
    }

    galleryItems.forEach((image, index) => {
      image.closest(".gallery-item").addEventListener("click", () => openLightbox(index));
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", () => renderLightbox(activeGalleryIndex - 1));
    lightboxNext.addEventListener("click", () => renderLightbox(activeGalleryIndex + 1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        renderLightbox(activeGalleryIndex - 1);
      } else if (event.key === "ArrowRight") {
        renderLightbox(activeGalleryIndex + 1);
      }
    });

    fetchWishes();

