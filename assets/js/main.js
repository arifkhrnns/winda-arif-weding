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
    const saveCalendarButton = document.getElementById("saveCalendar");

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

    function formatIcsDate(date) {
      return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    }

    function buildCalendarFile() {
      const startDate = new Date("2026-07-05T08:00:00+07:00");
      const endDate = new Date("2026-07-05T15:30:00+07:00");
      const createdDate = new Date();
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Winda Arif Wedding//Undangan Digital//ID",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:winda-arif-${startDate.getTime()}@undangan-digital`,
        `DTSTAMP:${formatIcsDate(createdDate)}`,
        `DTSTART:${formatIcsDate(startDate)}`,
        `DTEND:${formatIcsDate(endDate)}`,
        "SUMMARY:Winda & Arif Wedding Day",
        "DESCRIPTION:Akad Nikah pukul 08.00 WIB dan resepsi sesuai waktu yang tertera pada undangan Anda.",
        "LOCATION:Gedung Serbaguna Ath Thoyyibah, Bekasi",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      return new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    }

    function downloadCalendarFile() {
      const calendarFile = buildCalendarFile();
      const fileUrl = URL.createObjectURL(calendarFile);
      const tempLink = document.createElement("a");
      tempLink.href = fileUrl;
      tempLink.download = "winda-arif-save-the-date.ics";
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    }

    if (saveCalendarButton) {
      saveCalendarButton.addEventListener("click", () => {
        downloadCalendarFile();
      });
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.14) {
          entry.target.classList.add("is-visible");
          return;
        }

        if (!entry.isIntersecting) {
          entry.target.classList.remove("is-visible");
        }
      });
    }, {
      threshold: [0, 0.14],
      rootMargin: "0px 0px -8% 0px"
    });

    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

    const overlay = document.getElementById("invitationCover");
    const openButton = document.getElementById("openInvitation");
    const openingSection = document.getElementById("openingVideoSection");
    const openingVideo = document.getElementById("openingVideo");
    const body = document.body;
    const bgMusic = document.getElementById("bgMusic");
    const audioToggle = document.getElementById("audioToggle");
    const experienceScroll = document.querySelector(".experience-scroll");
    const storyTimeline = document.querySelector(".story-grid");
    const desktopExperienceQuery = window.matchMedia("(min-width: 821px)");
    const openingNameTime = 10;
    let invitationOpened = false;
    let openingFinished = false;
    let userPausedAudio = false;
    let autoPausedAudio = false;

    function shouldProxyScroll() {
      return desktopExperienceQuery.matches && experienceScroll && !body.classList.contains("locked");
    }

    function updateStoryProgress() {
      if (!storyTimeline) {
        return;
      }

      const rect = storyTimeline.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const start = viewportHeight * 0.68;
      const end = viewportHeight * 0.18;
      const distance = Math.max(rect.height + start - end, 1);
      const progress = Math.min(Math.max((start - rect.top) / distance, 0), 1);
      storyTimeline.style.setProperty("--story-progress", `${(progress * 100).toFixed(2)}%`);
    }

    async function playAudio() {
      try {
        bgMusic.volume = 1;
        await bgMusic.play();
        audioToggle.textContent = "♪";
      } catch (error) {
        audioToggle.textContent = "♫";
      }
    }

    function pauseAudio() {
      bgMusic.pause();
      audioToggle.textContent = "♫";
    }

    async function syncAudioWithPageState() {
      if (!invitationOpened || userPausedAudio) {
        return;
      }

      const pageInactive = document.hidden || !document.hasFocus();

      if (pageInactive && !bgMusic.paused) {
        autoPausedAudio = true;
        pauseAudio();
        return;
      }

      if (!pageInactive && autoPausedAudio && bgMusic.paused) {
        autoPausedAudio = false;
        await playAudio();
      }
    }

    async function openInvitationContent(options = {}) {
      const { playMusic = true } = options;

      overlay.classList.add("is-hidden");
      body.classList.remove("locked");
      invitationOpened = true;
      userPausedAudio = false;
      autoPausedAudio = false;
      updateStoryProgress();

      if (playMusic) {
        await playAudio();
      }
    }

    function handleOpeningVideoTime() {
      if (openingVideo.currentTime >= openingNameTime) {
        openingSection.classList.add("show-names");
      }
    }

    async function finishOpeningVideo() {
      if (openingFinished) {
        return;
      }

      openingFinished = true;
      openingVideo.pause();
      openingVideo.removeEventListener("timeupdate", handleOpeningVideoTime);
      openingSection.classList.remove("is-active");
      openingSection.classList.add("is-ended", "show-names");

      if (!userPausedAudio && bgMusic.paused) {
        await playAudio();
      }
    }

    async function playOpeningVideo() {
      await openInvitationContent();

      if (!openingSection || !openingVideo) {
        return;
      }

      openingFinished = false;
      openingSection.classList.remove("is-ended", "show-names");
      openingSection.classList.add("is-active");
      openingVideo.loop = false;
      openingVideo.muted = false;
      try {
        openingVideo.currentTime = 0;
      } catch (error) {
        openingVideo.load();
      }
      openingVideo.addEventListener("timeupdate", handleOpeningVideoTime);
      openingVideo.addEventListener("ended", finishOpeningVideo, { once: true });
      openingVideo.addEventListener("error", finishOpeningVideo, { once: true });

      try {
        await openingVideo.play();
      } catch (error) {
        try {
          openingVideo.muted = true;
          await openingVideo.play();
        } catch (fallbackError) {
          await finishOpeningVideo();
        }
      }
    }

    openButton.addEventListener("click", () => {
      playOpeningVideo();
    });

    audioToggle.addEventListener("click", async () => {
      if (bgMusic.paused) {
        userPausedAudio = false;
        autoPausedAudio = false;
        await playAudio();
      } else {
        userPausedAudio = true;
        autoPausedAudio = false;
        pauseAudio();
      }
    });

    document.addEventListener("visibilitychange", () => {
      syncAudioWithPageState();
    });

    window.addEventListener("blur", () => {
      syncAudioWithPageState();
    });

    window.addEventListener("focus", () => {
      syncAudioWithPageState();
    });

    window.addEventListener("pagehide", () => {
      if (!bgMusic.paused) {
        autoPausedAudio = true;
        pauseAudio();
      }
    });

    window.addEventListener("wheel", (event) => {
      if (!shouldProxyScroll()) {
        return;
      }

      if (event.target.closest(".experience-scroll")) {
        return;
      }

      event.preventDefault();
      experienceScroll.scrollBy({
        top: event.deltaY,
        left: 0,
        behavior: "auto"
      });
    }, { passive: false });

    window.addEventListener("scroll", updateStoryProgress, { passive: true });
    window.addEventListener("resize", updateStoryProgress);

    if (experienceScroll) {
      experienceScroll.addEventListener("scroll", updateStoryProgress, { passive: true });
    }

    updateStoryProgress();

    const sessionConfig = {
      "1": {
        label: "11.00 - 13.00 WIB",
        time: "Minggu, 5 Juli 2026<br />11.00 WIB - 13.00 WIB",
        note: "Mohon hadir sesuai waktu yang tertera pada undangan.",
        intro: "Sebuah selebrasi hangat bersama keluarga, sahabat, dan orang terkasih."
      },
      "2": {
        label: "13.30 - 15.30 WIB",
        time: "Minggu, 5 Juli 2026<br />13.30 WIB - 15.30 WIB",
        note: "Mohon hadir sesuai waktu yang tertera pada undangan.",
        intro: "Sebuah selebrasi hangat bersama keluarga, sahabat, dan orang terkasih."
      }
    };

    const params = new URLSearchParams(window.location.search);
    const guest = params.get("to");
    const session = params.get("sesi");
    const activeSession = sessionConfig[session] || sessionConfig["1"];

    const sessionPills = document.querySelectorAll("[data-session-pill]");
    const receptionTime = document.getElementById("receptionTime");
    const sessionNote = document.getElementById("sessionNote");
    const receptionIntro = document.getElementById("receptionIntro");

    sessionPills.forEach((pill) => {
      pill.textContent = activeSession.label;
    });

    if (receptionTime) {
      receptionTime.innerHTML = activeSession.time;
    }

    if (sessionNote) {
      sessionNote.textContent = activeSession.note;
    }

    if (receptionIntro) {
      receptionIntro.textContent = activeSession.intro;
    }

    if (guest) {
      const cleanGuestName = guest.replace(/\+/g, " ").trim();
      document.getElementById("guestName").textContent = cleanGuestName || "Bapak/Ibu/Saudara/i";
      const guestbookNameField = document.getElementById("guestbookName");
      if (guestbookNameField) {
        guestbookNameField.value = cleanGuestName;
      }
    }

    const giftCards = document.querySelectorAll("[data-gift-card]");
    const giftCopyButtons = document.querySelectorAll(".gift-copy");
    const copyToast = document.getElementById("copyToast");
    let copyToastTimer;

    function showCopyToast(message) {
      if (!copyToast) {
        return;
      }

      copyToast.textContent = message;
      copyToast.classList.add("is-visible");
      window.clearTimeout(copyToastTimer);
      copyToastTimer = window.setTimeout(() => {
        copyToast.classList.remove("is-visible");
      }, 1800);
    }

    function copyTextFallback(text) {
      const tempInput = document.createElement("textarea");
      tempInput.value = text;
      tempInput.setAttribute("readonly", "");
      tempInput.style.position = "fixed";
      tempInput.style.left = "-9999px";
      document.body.appendChild(tempInput);
      tempInput.focus();
      tempInput.select();
      tempInput.setSelectionRange(0, text.length);

      try {
        return document.execCommand("copy");
      } catch (error) {
        return false;
      } finally {
        tempInput.remove();
      }
    }

    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (error) {
          return copyTextFallback(text);
        }
      }

      return copyTextFallback(text);
    }

    giftCards.forEach((card) => {
      const trigger = card.querySelector(".gift-card__trigger");
      const details = card.querySelector(".gift-card__details");

      if (!trigger || !details) {
        return;
      }

      trigger.addEventListener("click", () => {
        const shouldOpen = !card.classList.contains("is-open");
        card.classList.toggle("is-open", shouldOpen);
        details.hidden = !shouldOpen;
        trigger.setAttribute("aria-expanded", String(shouldOpen));
      });
    });

    giftCopyButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const copyValue = button.dataset.copyText || "";

        try {
          const copied = await copyText(copyValue);
          showCopyToast(copied ? "Nomor berhasil disalin" : "Nomor belum berhasil disalin");
        } catch (error) {
          showCopyToast("Nomor belum berhasil disalin");
        }
      });
    });

    const wishForm = document.getElementById("wishForm");
    const wishItems = document.getElementById("wishItems");
    const wishStatus = document.getElementById("wishStatus");
    const wishSubmitButton = wishForm ? wishForm.querySelector('button[type="submit"]') : null;
    const guestbookForm = document.getElementById("guestbookForm");
    const guestbookItems = document.getElementById("guestbookItems");
    const guestbookCount = document.getElementById("guestbookCount");
    const guestbookStatus = document.getElementById("guestbookStatus");
    const guestbookSubmitButton = guestbookForm ? guestbookForm.querySelector('button[type="submit"]') : null;

    function renderWishItem(wish) {
      const item = document.createElement("div");
      item.className = "wish-item";

      const title = document.createElement("strong");
      title.textContent = wish.name;

      if (wish.attendance_status === "Hadir") {
        const badge = document.createElement("span");
        badge.className = "attendance-badge attendance-badge-present";
        badge.setAttribute("aria-label", "Hadir");
        badge.title = "Hadir";
        title.appendChild(badge);
      } else if (wish.attendance_status === "Tidak Hadir") {
        const badge = document.createElement("span");
        badge.className = "attendance-badge attendance-badge-absent";
        badge.setAttribute("aria-label", "Tidak Hadir");
        badge.title = "Tidak Hadir";
        title.appendChild(badge);
      }

      const body = document.createElement("p");
      body.textContent = wish.message;

      item.append(title, body);
      return item;
    }

    function setWishStatus(message) {
      if (!wishStatus) {
        return;
      }

      wishStatus.textContent = message;
      wishStatus.hidden = !message;
    }

    function setGuestbookStatus(message) {
      if (!guestbookStatus) {
        return;
      }

      guestbookStatus.textContent = message;
      guestbookStatus.hidden = !message;
    }

    function renderWishCollections(wishes) {
      if (wishItems) {
        wishItems.innerHTML = "";
      }

      if (guestbookItems) {
        guestbookItems.innerHTML = "";
      }

      if (guestbookCount) {
        guestbookCount.textContent = `${wishes.length} Ucapan`;
      }

      wishes.forEach((wish) => {
        if (wishItems) {
          wishItems.appendChild(renderWishItem(wish));
        }

        if (guestbookItems) {
          guestbookItems.appendChild(renderWishItem(wish));
        }
      });
    }

    async function fetchWishes() {
      if (!wishesEnabled) {
        setWishStatus("Ucapan akan tampil di sini setelah Supabase dihubungkan.");
        setGuestbookStatus("Ucapan akan tampil setelah Supabase dihubungkan.");
        return;
      }

      setWishStatus("Memuat ucapan tamu...");
      setGuestbookStatus("Memuat ucapan tamu...");

      try {
        let response = await fetch(
          `${SUPABASE_URL}/rest/v1/${SUPABASE_WISHES_TABLE}?select=id,name,message,attendance_status,created_at&is_approved=eq.true&order=created_at.desc&limit=20`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        );

        if (!response.ok) {
          response = await fetch(
            `${SUPABASE_URL}/rest/v1/${SUPABASE_WISHES_TABLE}?select=id,name,message,created_at&is_approved=eq.true&order=created_at.desc&limit=20`,
            {
              headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`
              }
            }
          );
        }

        if (!response.ok) {
          throw new Error("Gagal memuat ucapan dari Supabase.");
        }

        const wishes = await response.json();
        renderWishCollections(wishes);

        if (!wishes.length) {
          setWishStatus("Belum ada ucapan. Jadilah yang pertama mengirim doa terbaik.");
          setGuestbookStatus("Belum ada ucapan. Jadilah yang pertama mengirim doa terbaik.");
          return;
        }

        setWishStatus("");
        setGuestbookStatus("");
      } catch (error) {
        console.error(error);
        setWishStatus("Ucapan belum bisa dimuat. Periksa konfigurasi Supabase Anda.");
        setGuestbookStatus("Ucapan belum bisa dimuat. Periksa konfigurasi Supabase Anda.");
      }
    }

    if (wishForm && wishSubmitButton) {
      wishForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const wishName = document.getElementById("wishName").value.trim();
        const wishText = document.getElementById("wishText").value.trim();
        const wishWebsite = document.getElementById("wishWebsite").value.trim();

        if (!wishName || !wishText) {
          setWishStatus("Nama dan ucapan wajib diisi.");
          return;
        }

        if (wishWebsite) {
          wishForm.reset();
          setWishStatus("Ucapan diterima. Terima kasih atas doa terbaiknya.");
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
              Prefer: "return=minimal"
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
          setWishStatus("Ucapan berhasil dikirim dan akan tampil setelah disetujui.");
        } catch (error) {
          console.error(error);
          setWishStatus("Ucapan belum berhasil dikirim. Coba lagi beberapa saat lagi.");
        } finally {
          wishSubmitButton.disabled = false;
        }
      });
    }

    if (guestbookForm && guestbookSubmitButton) {
      guestbookForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = new FormData(event.currentTarget);
        const guestbookName = String(form.get("name") || "").trim();
        const guestbookMessage = String(form.get("message") || "").trim();
        const attendanceStatus = String(form.get("attendance_status") || "").trim();
        const guestbookWebsite = String(form.get("website") || "").trim();

        if (!guestbookName || !guestbookMessage || !attendanceStatus) {
          setGuestbookStatus("Nama, konfirmasi kehadiran, dan ucapan wajib diisi.");
          return;
        }

        if (guestbookWebsite) {
          guestbookForm.reset();
          setGuestbookStatus("Ucapan diterima. Terima kasih atas doa terbaiknya.");
          return;
        }

        if (!wishesEnabled) {
          setGuestbookStatus("Isi konfigurasi Supabase terlebih dahulu untuk mengaktifkan ucapan tamu.");
          return;
        }

        guestbookSubmitButton.disabled = true;
        setGuestbookStatus("Mengirim konfirmasi dan ucapan...");

        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_WISHES_TABLE}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              Prefer: "return=minimal"
            },
            body: JSON.stringify({
              name: guestbookName,
              message: guestbookMessage,
              attendance_status: attendanceStatus
            })
          });

          if (!response.ok) {
            throw new Error("Gagal menyimpan konfirmasi ke Supabase.");
          }

          guestbookForm.reset();
          await fetchWishes();
          setGuestbookStatus("Konfirmasi dan ucapan berhasil dikirim. Ucapan akan tampil setelah disetujui.");
        } catch (error) {
          console.error(error);
          setGuestbookStatus("Konfirmasi belum berhasil dikirim. Coba lagi beberapa saat lagi.");
        } finally {
          guestbookSubmitButton.disabled = false;
        }
      });
    }

    const galleryThumbs = Array.from(document.querySelectorAll("[data-gallery-thumb]"));
    const galleryItems = galleryThumbs
      .map((thumb) => thumb.querySelector("img"))
      .filter(Boolean);
    const galleryMain = document.querySelector("[data-gallery-open]");
    const galleryMainImage = document.querySelector("[data-gallery-main]");
    const galleryStrip = document.querySelector("[data-gallery-strip]");
    const lightbox = document.getElementById("galleryLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCounter = document.getElementById("lightboxCounter");
    const lightboxClose = document.getElementById("lightboxClose");
    const lightboxPrev = document.getElementById("lightboxPrev");
    const lightboxNext = document.getElementById("lightboxNext");
    let activeGalleryIndex = Math.max(
      0,
      galleryThumbs.findIndex((thumb) => thumb.classList.contains("is-active"))
    );
    let galleryScrollFrame = 0;
    let isDraggingGallery = false;
    let hasDraggedGallery = false;
    let galleryDragStartX = 0;
    let galleryDragStartScrollLeft = 0;

    function updateGalleryMain(index, options = {}) {
      if (!galleryItems.length || !galleryMainImage) {
        return;
      }

      const total = galleryItems.length;
      activeGalleryIndex = (index + total) % total;
      const activeImage = galleryItems[activeGalleryIndex];
      const activeThumb = galleryThumbs[activeGalleryIndex];
      const activeSrc = activeImage.currentSrc || activeImage.src;

      if (galleryMain && options.animate !== false) {
        galleryMain.classList.add("is-switching");
      }

      galleryMainImage.src = activeSrc;
      galleryMainImage.alt = activeImage.alt;

      if (galleryMain) {
        galleryMain.style.setProperty("--gallery-active-bg", `url("${activeSrc}")`);
      }

      galleryThumbs.forEach((thumb, thumbIndex) => {
        const isActive = thumbIndex === activeGalleryIndex;
        thumb.classList.toggle("is-active", isActive);
        thumb.setAttribute("aria-selected", String(isActive));
      });

      if (activeThumb && options.scroll !== false) {
        activeThumb.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: options.scrollBehavior || "smooth"
        });
      }

      if (galleryMain && options.animate !== false) {
        window.setTimeout(() => galleryMain.classList.remove("is-switching"), 120);
      }
    }

    function getCenteredGalleryIndex() {
      if (!galleryStrip || !galleryThumbs.length) {
        return activeGalleryIndex;
      }

      const stripRect = galleryStrip.getBoundingClientRect();
      const stripCenter = stripRect.left + stripRect.width / 2;
      let centeredIndex = activeGalleryIndex;
      let closestDistance = Number.POSITIVE_INFINITY;

      galleryThumbs.forEach((thumb, index) => {
        const thumbRect = thumb.getBoundingClientRect();
        const thumbCenter = thumbRect.left + thumbRect.width / 2;
        const distance = Math.abs(stripCenter - thumbCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          centeredIndex = index;
        }
      });

      return centeredIndex;
    }

    function syncGalleryMainToCenter() {
      galleryScrollFrame = 0;
      const centeredIndex = getCenteredGalleryIndex();

      if (centeredIndex !== activeGalleryIndex) {
        updateGalleryMain(centeredIndex, { animate: false, scroll: false });
      }
    }

    function requestGalleryCenterSync() {
      if (galleryScrollFrame) {
        return;
      }

      galleryScrollFrame = window.requestAnimationFrame(syncGalleryMainToCenter);
    }

    function renderLightbox(index) {
      if (!galleryItems.length || !lightboxImage || !lightboxCounter) {
        return;
      }

      const total = galleryItems.length;
      updateGalleryMain(index, { animate: false });
      const activeImage = galleryItems[activeGalleryIndex];
      lightboxImage.src = activeImage.src;
      lightboxImage.alt = activeImage.alt;
      lightboxCounter.textContent = `${activeGalleryIndex + 1} / ${total}`;
    }

    function openLightbox(index = activeGalleryIndex) {
      if (!lightbox || !galleryItems.length) {
        return;
      }

      renderLightbox(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("viewer-open");
    }

    function closeLightbox() {
      if (!lightbox || !lightboxImage) {
        return;
      }

      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("viewer-open");
      lightboxImage.src = "";
    }

    galleryThumbs.forEach((thumb, index) => {
      thumb.addEventListener("click", () => {
        if (hasDraggedGallery) {
          return;
        }

        updateGalleryMain(index);
      });
    });

    if (galleryMain) {
      galleryMain.addEventListener("click", () => openLightbox());
    }

    if (galleryStrip) {
      galleryStrip.addEventListener("scroll", requestGalleryCenterSync, { passive: true });

      galleryStrip.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse") {
          return;
        }

        isDraggingGallery = true;
        hasDraggedGallery = false;
        galleryDragStartX = event.clientX;
        galleryDragStartScrollLeft = galleryStrip.scrollLeft;
        galleryStrip.setPointerCapture(event.pointerId);
      });

      galleryStrip.addEventListener("pointermove", (event) => {
        if (!isDraggingGallery) {
          return;
        }

        const dragDistance = event.clientX - galleryDragStartX;

        if (Math.abs(dragDistance) > 4) {
          hasDraggedGallery = true;
        }

        galleryStrip.scrollLeft = galleryDragStartScrollLeft - dragDistance;
      });

      galleryStrip.addEventListener("pointerup", (event) => {
        if (!isDraggingGallery) {
          return;
        }

        isDraggingGallery = false;
        if (galleryStrip.hasPointerCapture(event.pointerId)) {
          galleryStrip.releasePointerCapture(event.pointerId);
        }
        window.setTimeout(() => {
          hasDraggedGallery = false;
        }, 0);
      });

      galleryStrip.addEventListener("pointercancel", () => {
        isDraggingGallery = false;
        hasDraggedGallery = false;
      });

      galleryStrip.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          updateGalleryMain(activeGalleryIndex - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          updateGalleryMain(activeGalleryIndex + 1);
        }
      });
    }

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", () => renderLightbox(activeGalleryIndex - 1));
    }

    if (lightboxNext) {
      lightboxNext.addEventListener("click", () => renderLightbox(activeGalleryIndex + 1));
    }

    if (lightbox) {
      lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
          closeLightbox();
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (!lightbox) {
        return;
      }

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

    updateGalleryMain(activeGalleryIndex, { animate: false, scroll: false });

    fetchWishes();

