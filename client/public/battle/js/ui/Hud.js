export class Hud {
  constructor(root) {
    this.root = root;
    this.balloonIcons = Array.from(root.querySelectorAll(".balloon-icon"));
    this.speedReadout = root.querySelector("#speed-readout");
    this.statusBanner = root.querySelector("#status-banner");
    this.itemSlot = root.querySelector("#item-slot");
    this.itemIcon = root.querySelector("#item-icon");
    this.itemLabel = root.querySelector("#item-label");
  }

  show() {
    this.root.classList.remove("hidden");
  }

  hide() {
    this.root.classList.add("hidden");
  }

  setStatus(text) {
    if (this.statusBanner) {
      this.statusBanner.textContent = text;
    }
  }

  setItem(item) {
    if (!this.itemSlot) return;
    if (!item) {
      this.itemSlot.classList.remove("ready");
      if (this.itemIcon) {
        this.itemIcon.textContent = "?";
        this.itemIcon.style.background = "#fff";
      }
      if (this.itemLabel) {
        this.itemLabel.textContent = "Empty";
      }
      return;
    }

    this.itemSlot.classList.add("ready");
    if (this.itemIcon) {
      this.itemIcon.textContent = item.label?.charAt(0) ?? "!";
      this.itemIcon.style.background = item.color || "#fff";
    }
    if (this.itemLabel) {
      this.itemLabel.textContent = item.label || "Item";
    }
  }

  setRoulette(active, item) {
    if (!this.itemSlot) return;
    this.itemSlot.classList.toggle("roulette", active);
    if (active && item) {
      if (this.itemIcon) {
        this.itemIcon.textContent = item.label?.charAt(0) ?? "?";
        this.itemIcon.style.background = item.color || "#fff";
      }
      if (this.itemLabel) {
        this.itemLabel.textContent = "Roulette";
      }
    }
  }

  update({ balloons, speed }) {
    this.balloonIcons.forEach((icon, index) => {
      icon.classList.toggle("off", index >= balloons);
    });
    if (this.speedReadout) {
      this.speedReadout.textContent = Math.round(Math.abs(speed)).toString();
    }
  }
}
