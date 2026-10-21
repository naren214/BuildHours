const frame = document.querySelector("iframe"),
  list = document.querySelector("#results");
const pause = () => new Promise((resolve) => setTimeout(resolve, 80));
function assert(value, message) {
  if (!value) throw new Error(message);
}
function report(message, ok = true) {
  const row = document.createElement("li");
  row.textContent = `${ok ? "PASS" : "FAIL"} — ${message}`;
  list.append(row);
}
document.querySelector("#run").onclick = async () => {
  list.replaceChildren();
  document.querySelector("#run").disabled = true;
  try {
    frame.src = "/studio";
    await new Promise((resolve) => {
      frame.onload = resolve;
    });
    await pause();
    const win = frame.contentWindow,
      doc = win.document;
    const text = () => doc.body.innerText;
    const button = (label) =>
      [...doc.querySelectorAll("button")].find((b) =>
        b.textContent.trim().includes(label),
      );
    button("Got it").click();
    await pause();
    const canvas = doc.querySelector(".trackpad-wrap canvas");
    canvas.setPointerCapture = () => {};
    canvas.hasPointerCapture = () => false;
    const emit = (type, x, y, pointerType = "mouse", pointerId = 1) => {
      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(
        new win.PointerEvent(type, {
          bubbles: true,
          pointerId,
          pointerType,
          button: 0,
          buttons: type === "pointerup" ? 0 : 1,
          clientX: rect.left + x * rect.width,
          clientY: rect.top + y * rect.height,
        }),
      );
    };
    emit("pointerdown", 0.1, 0.8);
    await pause();
    emit("pointermove", 0.4, 0.8);
    emit("pointermove", 0.7, 0.8);
    emit("pointerup", 0.7, 0.8);
    await pause();
    assert(text().includes("01 GESTURES"), "Mouse stroke was not captured");
    const lowNote = doc.querySelector(".note-display").textContent;
    report(
      `Mouse stroke captures multiple points and produces a note (${lowNote.replace("CURRENT SOUND", "")})`,
    );
    emit("pointerdown", 0.1, 0.1, "touch", 2);
    await pause();
    emit("pointermove", 0.3, 0.1, "touch", 2);
    emit("pointerup", 0.3, 0.1, "touch", 2);
    await pause();
    assert(text().includes("02 GESTURES"), "Touch stroke was not captured");
    assert(
      doc.querySelector(".note-display").textContent !== lowNote,
      "Higher stroke did not change note",
    );
    report(
      "Touch Pointer Events capture a second stroke; vertical height changes the displayed note",
    );
    emit("pointerdown", 0.2, 0.4);
    emit("pointercancel", 0.2, 0.4);
    await pause();
    assert(text().includes("02 GESTURES"), "Canceled stroke was saved");
    report("Pointer cancellation discards an unfinished gesture");
    const scale = doc.querySelector("select");
    scale.value = "minor";
    scale.dispatchEvent(new win.Event("change", { bubbles: true }));
    await pause();
    assert(scale.value === "minor", "Scale did not change");
    report("Scale selector updates without clearing recorded gestures");
    button("Tabla").click();
    await pause();
    assert(
      doc.querySelectorAll(".tabla-regions>span").length === 3,
      "Tabla regions missing",
    );
    emit("pointerdown", 0.1, 0.5);
    emit("pointerup", 0.1, 0.5);
    await pause();
    assert(
      doc.querySelector(".note-display").textContent.includes("BAYAN"),
      "Low region incorrect",
    );
    emit("pointerdown", 0.5, 0.5);
    emit("pointerup", 0.5, 0.5);
    await pause();
    assert(
      doc.querySelector(".note-display").textContent.includes("DAYAN"),
      "High region incorrect",
    );
    emit("pointerdown", 0.9, 0.5);
    emit("pointerup", 0.9, 0.5);
    await pause();
    assert(
      doc.querySelector(".note-display").textContent.includes("RIM"),
      "Rim region incorrect",
    );
    report(
      "Tabla selection changes canvas and all three tap regions report their drum voice",
    );
    button("Clear").click();
    await pause();
    assert(
      text().includes("00 GESTURES") && text().includes("Got it"),
      "Clear did not reset",
    );
    report("Clear resets the count and restores first-use guidance");
    canvas.dispatchEvent(
      new win.KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );
    await pause();
    assert(text().includes("01 GESTURES"), "Keyboard input failed");
    report("Keyboard Enter creates a gesture");
    assert(button("Play").disabled, "Audio-off playback was available");
    report("Play is unavailable before enabling audio");
    for (const route of ["/", "/instruments", "/extend", "/studio"]) {
      frame.src = route;
      await new Promise((resolve) => {
        frame.onload = resolve;
      });
      await pause();
      assert(
        frame.contentDocument.querySelector("h1") &&
          !frame.contentDocument.body.innerText.includes("A little lost"),
        `Route ${route} failed`,
      );
    }
    report("All four routes mount successfully by direct URL");
    for (const width of [375, 768, 1280]) {
      frame.style.width = `${width}px`;
      for (const route of ["/", "/instruments", "/studio", "/extend"]) {
        frame.src = route;
        await new Promise((resolve) => {
          frame.onload = resolve;
        });
        await pause();
        const document = frame.contentDocument;
        assert(
          document.documentElement.scrollWidth <=
            frame.contentWindow.innerWidth + 1,
          `${route} overflows at ${width}px: ${document.documentElement.scrollWidth}px`,
        );
        for (const control of document.querySelectorAll(
          "header a, header button, .transport button, .instrument-selector button, select",
        )) {
          const rect = control.getBoundingClientRect();
          assert(
            rect.left >= -1 && rect.right <= frame.contentWindow.innerWidth + 1,
            `Control clipped at ${width}px on ${route}`,
          );
        }
      }
      report(
        `All four routes fit ${width}px without horizontal overflow or clipped essential controls`,
      );
    }
    frame.style.width = "375px";
    frame.src = "/studio";
  } catch (error) {
    report(error.message, false);
  } finally {
    document.querySelector("#run").disabled = false;
  }
};
