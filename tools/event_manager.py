#!/usr/bin/env python3
"""Simple local GUI for adding and editing events in a Jekyll site's _data/events.json."""

import json
import re
import shutil
import tkinter as tk
from datetime import datetime
from pathlib import Path
from tkinter import filedialog, messagebox, simpledialog, ttk


ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "_data" / "events.json"
EVENT_IMAGES = ROOT / "images" / "events"


class ScrollableFrame(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent)
        self.canvas = tk.Canvas(self, highlightthickness=0)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=self.canvas.yview)
        self.body = ttk.Frame(self.canvas, padding=16)
        self.body.bind(
            "<Configure>",
            lambda _e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        self.window = self.canvas.create_window((0, 0), window=self.body, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)
        self.canvas.bind("<Configure>", lambda e: self.canvas.itemconfigure(self.window, width=e.width))
        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")


class EventManager:
    def __init__(self, root):
        self.root = root
        root.title("MSA FAST Peshawar — Event Manager")
        root.geometry("850x850")
        root.minsize(700, 650)

        self.events = []
        self.current_index = None
        self.speakers = []
        self.image_vars = {}
        self.vars = {}

        if not DATA_FILE.exists():
            messagebox.showerror("File not found", f"Could not find:\n{DATA_FILE}")
            root.destroy()
            return

        self.load_events()
        self.build_ui()
        self.clear_form()

    def load_events(self):
        try:
            with DATA_FILE.open("r", encoding="utf-8") as f:
                self.events = json.load(f)
            if not isinstance(self.events, list):
                raise ValueError("The JSON root must be an array of events.")
        except Exception as exc:
            messagebox.showerror("Could not read events.json", str(exc))
            self.events = []

    def build_ui(self):
        top = ttk.Frame(self.root, padding=(16, 12))
        top.pack(fill="x")
        ttk.Label(top, text="MSA Event Manager", font=("TkDefaultFont", 17, "bold")).pack(anchor="w")
        ttk.Label(top, text=f"Editing: {DATA_FILE}", foreground="#666").pack(anchor="w", pady=(3, 10))

        controls = ttk.Frame(top)
        controls.pack(fill="x")
        ttk.Label(controls, text="Existing event:").pack(side="left")
        self.event_choice = tk.StringVar()
        self.event_combo = ttk.Combobox(controls, textvariable=self.event_choice, state="readonly", width=48)
        self.event_combo.pack(side="left", padx=8, fill="x", expand=True)
        self.event_combo.bind("<<ComboboxSelected>>", self.load_selected_event)
        ttk.Button(controls, text="New Event", command=self.clear_form).pack(side="left")

        self.scroll = ScrollableFrame(self.root)
        self.scroll.pack(fill="both", expand=True)
        self.form = self.scroll.body

        self.add_section("Event information")
        self.add_entry("id", "Event ID *", "e.g. github-workshop-session-3")
        self.add_entry("title", "Title *")
        self.add_entry("tagline", "Tagline")
        self.add_text("description", "Description")
        self.add_entry("date", "Date * (YYYY-MM-DD)", "2026-12-01")
        self.add_entry("category", "Category", "Workshop")
        self.add_entry("tags", "Tags (comma-separated)", "Git, GitHub, Open Source")
        self.add_check("featured", "Featured event")

        self.add_section("Time")
        self.add_entry("start", "Start time (HH:MM)", "14:00")
        self.add_entry("end", "End time (HH:MM)", "16:00")
        self.add_entry("timezone", "Timezone", "PKT (UTC+5)")

        self.add_section("Venue")
        self.add_entry("venue_name", "Venue name")
        self.add_entry("campus", "Campus", "FAST NUCES Peshawar")
        self.add_entry("room", "Room")
        self.add_check("is_virtual", "This is a virtual event")
        self.add_entry("virtual_link", "Virtual meeting URL (optional)")

        self.add_section("Registration")
        self.add_entry("registration_url", "Registration URL (optional)")
        self.add_entry("registration_deadline", "Registration deadline (ISO format, optional)",
                       "2026-12-01T23:59:59+05:00")
        self.add_entry("status", "Status", "upcoming")

        self.add_section("Speakers")
        speaker_bar = ttk.Frame(self.form)
        speaker_bar.pack(fill="x", pady=(2, 5))
        self.speaker_list = tk.Listbox(speaker_bar, height=4, exportselection=False)
        self.speaker_list.pack(side="left", fill="x", expand=True)
        speaker_buttons = ttk.Frame(speaker_bar)
        speaker_buttons.pack(side="left", padx=8)
        ttk.Button(speaker_buttons, text="Add", command=self.add_speaker).pack(fill="x", pady=2)
        ttk.Button(speaker_buttons, text="Edit", command=self.edit_speaker).pack(fill="x", pady=2)
        ttk.Button(speaker_buttons, text="Remove", command=self.remove_speaker).pack(fill="x", pady=2)

        self.add_section("Event images")
        self.add_file_field("poster", "Poster image")
        self.add_file_field("thumbnail", "Thumbnail image")
        self.add_entry("alt_text", "Image alt text")

        self.add_section("Event recap (for completed events)")
        self.add_entry("attendee_count", "Attendee count (optional)")
        self.add_entry("photo_album", "Photo album URL (optional)")
        self.add_entry("report_url", "Report URL (optional)")

        bottom = ttk.Frame(self.root, padding=12)
        bottom.pack(fill="x")
        ttk.Button(bottom, text="Save Event", command=self.save_event).pack(side="right")
        ttk.Button(bottom, text="Delete Selected Event", command=self.delete_event).pack(side="right", padx=8)
        ttk.Button(bottom, text="Reload JSON", command=self.reload).pack(side="left")

        self.refresh_event_choices()

    def add_section(self, title):
        ttk.Label(self.form, text=title, font=("TkDefaultFont", 12, "bold")).pack(anchor="w", pady=(16, 7))

    def add_entry(self, key, label, placeholder=""):
        row = ttk.Frame(self.form)
        row.pack(fill="x", pady=4)
        ttk.Label(row, text=label, width=34).pack(side="left", anchor="nw")
        var = tk.StringVar(value=placeholder)
        self.vars[key] = var
        ttk.Entry(row, textvariable=var).pack(side="left", fill="x", expand=True)

    def add_text(self, key, label):
        ttk.Label(self.form, text=label).pack(anchor="w", pady=(5, 2))
        widget = tk.Text(self.form, height=4, wrap="word")
        widget.pack(fill="x")
        self.vars[key] = widget

    def add_check(self, key, label):
        var = tk.BooleanVar(value=False)
        self.vars[key] = var
        ttk.Checkbutton(self.form, text=label, variable=var).pack(anchor="w", pady=4)

    def add_file_field(self, key, label):
        row = ttk.Frame(self.form)
        row.pack(fill="x", pady=4)
        ttk.Label(row, text=label, width=34).pack(side="left")
        var = tk.StringVar()
        self.image_vars[key] = var
        ttk.Entry(row, textvariable=var).pack(side="left", fill="x", expand=True)
        ttk.Button(row, text="Browse…", command=lambda k=key: self.choose_image(k)).pack(side="left", padx=(6, 0))

    def choose_image(self, key):
        path = filedialog.askopenfilename(
            title="Choose event image",
            filetypes=[("Images", "*.png *.jpg *.jpeg *.webp *.gif"), ("All files", "*.*")]
        )
        if path:
            self.image_vars[key].set(path)

    def refresh_event_choices(self):
        labels = []
        for event in self.events:
            labels.append(f'{event.get("title", "(Untitled)")} — {event.get("date", "")} [{event.get("id", "")}]')
        self.event_combo["values"] = labels
        self.event_choice.set("")

    def get_text(self, key):
        value = self.vars[key]
        if isinstance(value, tk.Text):
            return value.get("1.0", "end").strip()
        return value.get().strip()

    def set_text(self, key, value):
        widget = self.vars[key]
        if isinstance(widget, tk.Text):
            widget.delete("1.0", "end")
            widget.insert("1.0", value or "")
        elif isinstance(widget, tk.BooleanVar):
            widget.set(bool(value))
        else:
            widget.set(value or "")

    def clear_form(self):
        self.current_index = None
        self.event_choice.set("")
        defaults = {
            "timezone": "PKT (UTC+5)", "start": "14:00", "end": "16:00",
            "campus": "FAST NUCES Peshawar", "status": "upcoming"
        }
        for key in self.vars:
            if isinstance(self.vars[key], tk.BooleanVar):
                self.vars[key].set(False)
            elif isinstance(self.vars[key], tk.Text):
                self.vars[key].delete("1.0", "end")
            else:
                self.vars[key].set(defaults.get(key, ""))
        for var in self.image_vars.values():
            var.set("")
        self.speakers = []
        self.refresh_speakers()

    def load_selected_event(self, _event=None):
        index = self.event_combo.current()
        if index < 0 or index >= len(self.events):
            return
        event = self.events[index]
        self.current_index = index
        time = event.get("time") or {}
        venue = event.get("venue") or {}
        image = event.get("image") or {}
        recap = event.get("recap") or {}

        values = {
            "id": event.get("id"), "title": event.get("title"), "tagline": event.get("tagline"),
            "description": event.get("description"), "date": event.get("date"),
            "category": event.get("category"), "tags": ", ".join(event.get("tags") or []),
            "featured": event.get("featured", False), "start": time.get("start"),
            "end": time.get("end"), "timezone": time.get("timezone"),
            "venue_name": venue.get("name"), "campus": venue.get("campus"),
            "room": venue.get("room"), "is_virtual": venue.get("isVirtual", False),
            "virtual_link": venue.get("virtualLink"), "registration_url": event.get("registrationUrl"),
            "registration_deadline": event.get("registrationDeadline"), "status": event.get("status"),
            "alt_text": image.get("altText"), "attendee_count": recap.get("attendeeCount"),
            "photo_album": recap.get("photoAlbumUrl"), "report_url": recap.get("reportUrl")
        }
        for key, value in values.items():
            self.set_text(key, value)
        self.image_vars["poster"].set(image.get("posterUrl") or "")
        self.image_vars["thumbnail"].set(image.get("thumbnailUrl") or "")
        self.speakers = list(event.get("speakers") or [])
        self.refresh_speakers()

    def refresh_speakers(self):
        self.speaker_list.delete(0, "end")
        for speaker in self.speakers:
            self.speaker_list.insert("end", f'{speaker.get("name", "Unnamed")} — {speaker.get("role", "")}')

    def speaker_dialog(self, speaker=None):
        result = {}
        win = tk.Toplevel(self.root)
        win.title("Speaker details")
        win.transient(self.root)
        win.grab_set()
        fields = [
            ("name", "Name"), ("role", "Role / designation"),
            ("organization", "Organization"), ("photoUrl", "Photo URL or local image path"),
            ("linkedinUrl", "LinkedIn URL")
        ]
        entries = {}
        for i, (key, label) in enumerate(fields):
            ttk.Label(win, text=label).grid(row=i, column=0, padx=10, pady=6, sticky="w")
            var = tk.StringVar(value=(speaker or {}).get(key, ""))
            entries[key] = var
            ttk.Entry(win, textvariable=var, width=48).grid(row=i, column=1, padx=10, pady=6)
        def choose_photo():
            path = filedialog.askopenfilename(parent=win, filetypes=[("Images", "*.png *.jpg *.jpeg *.webp")])
            if path:
                entries["photoUrl"].set(path)
        ttk.Button(win, text="Browse photo…", command=choose_photo).grid(row=len(fields), column=1, sticky="e", padx=10)
        def save():
            result.update({key: var.get().strip() for key, var in entries.items()})
            if not result["name"]:
                messagebox.showwarning("Missing name", "Enter the speaker's name.", parent=win)
                return
            win.destroy()
        ttk.Button(win, text="Save speaker", command=save).grid(row=len(fields)+1, column=1, sticky="e", padx=10, pady=12)
        win.wait_window()
        return result or None

    def add_speaker(self):
        speaker = self.speaker_dialog()
        if speaker:
            self.speakers.append(speaker)
            self.refresh_speakers()

    def edit_speaker(self):
        selection = self.speaker_list.curselection()
        if not selection:
            messagebox.showinfo("Select a speaker", "Choose a speaker to edit.")
            return
        index = selection[0]
        speaker = self.speaker_dialog(self.speakers[index])
        if speaker:
            self.speakers[index] = speaker
            self.refresh_speakers()

    def remove_speaker(self):
        selection = self.speaker_list.curselection()
        if selection:
            del self.speakers[selection[0]]
            self.refresh_speakers()

    def copy_image_if_needed(self, value, event_id, kind):
        value = (value or "").strip()
        if not value:
            return None
        source = Path(value).expanduser()
        if not source.is_file():
            # Existing website paths such as /images/events/poster.webp remain unchanged.
            return value
        EVENT_IMAGES.mkdir(parents=True, exist_ok=True)
        safe_id = re.sub(r"[^a-zA-Z0-9_-]+", "-", event_id).strip("-") or "event"
        destination = EVENT_IMAGES / f"{safe_id}-{kind}{source.suffix.lower()}"
        if source.resolve() != destination.resolve():
            shutil.copy2(source, destination)
        return f"/images/events/{destination.name}"

    def build_event(self):
        event_id = self.get_text("id")
        title = self.get_text("title")
        date = self.get_text("date")
        if not event_id or not title or not date:
            raise ValueError("Event ID, title, and date are required.")
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date must be a valid date in YYYY-MM-DD format.")

        existing = self.events[self.current_index] if self.current_index is not None else {}
        event = dict(existing)  # Keep any extra fields that may exist in the JSON.

        # Copy any selected local speaker photos into the website's event image folder.
        speaker_data = []
        for index, speaker in enumerate(self.speakers, start=1):
            speaker_copy = dict(speaker)
            speaker_copy["photoUrl"] = self.copy_image_if_needed(
                speaker.get("photoUrl"), event_id, f"speaker-{index}"
            )
            speaker_data.append(speaker_copy)

        event.update({
            "id": event_id,
            "title": title,
            "tagline": self.get_text("tagline"),
            "description": self.get_text("description"),
            "date": date,
            "time": {
                "start": self.get_text("start"),
                "end": self.get_text("end"),
                "timezone": self.get_text("timezone")
            },
            "venue": {
                "name": self.get_text("venue_name"),
                "campus": self.get_text("campus"),
                "room": self.get_text("room"),
                "isVirtual": self.vars["is_virtual"].get(),
                "virtualLink": self.get_text("virtual_link") or None
            },
            "category": self.get_text("category"),
            "tags": [tag.strip() for tag in self.get_text("tags").split(",") if tag.strip()],
            "status": self.get_text("status") or ("upcoming" if date >= datetime.now().strftime("%Y-%m-%d") else "completed"),
            "registrationUrl": self.get_text("registration_url") or None,
            "registrationDeadline": self.get_text("registration_deadline") or None,
            "speakers": speaker_data,
            "image": {
                "posterUrl": self.copy_image_if_needed(self.image_vars["poster"].get(), event_id, "poster"),
                "thumbnailUrl": self.copy_image_if_needed(self.image_vars["thumbnail"].get(), event_id, "thumb"),
                "altText": self.get_text("alt_text")
            },
            "featured": self.vars["featured"].get(),
            "recap": None
        })

        attendee_count = self.get_text("attendee_count")
        photo_album = self.get_text("photo_album")
        report_url = self.get_text("report_url")
        if attendee_count or photo_album or report_url:
            if attendee_count:
                try:
                    attendee_count = int(attendee_count)
                except ValueError:
                    raise ValueError("Attendee count must be a whole number.")
            event["recap"] = {
                "attendeeCount": attendee_count or None,
                "photoAlbumUrl": photo_album or None,
                "reportUrl": report_url or None
            }
        elif existing.get("recap") is None:
            event["recap"] = None

        return event

    def save_event(self):
        try:
            event = self.build_event()
            matches = [i for i, item in enumerate(self.events)
                       if item.get("id") == event["id"] and i != self.current_index]
            if matches:
                raise ValueError(f'Another event already uses ID "{event["id"]}". Choose a unique ID.')
            if self.current_index is None:
                self.events.append(event)
                action = "added"
            else:
                self.events[self.current_index] = event
                action = "updated"

            # Keep a backup before replacing the JSON file.
            backup = DATA_FILE.with_suffix(".json.bak")
            shutil.copy2(DATA_FILE, backup)
            with DATA_FILE.open("w", encoding="utf-8") as f:
                json.dump(self.events, f, indent=2, ensure_ascii=False)
                f.write("\n")

            self.refresh_event_choices()
            messagebox.showinfo("Saved", f"Event {action} successfully.\n\nUpdated:\n{DATA_FILE}")
            self.clear_form()
        except Exception as exc:
            messagebox.showerror("Could not save event", str(exc))

    def delete_event(self):
        if self.current_index is None:
            messagebox.showinfo("No event selected", "Select an existing event first.")
            return
        event = self.events[self.current_index]
        if not messagebox.askyesno("Delete event", f'Delete "{event.get("title", "this event")}"?'):
            return
        try:
            shutil.copy2(DATA_FILE, DATA_FILE.with_suffix(".json.bak"))
            del self.events[self.current_index]
            with DATA_FILE.open("w", encoding="utf-8") as f:
                json.dump(self.events, f, indent=2, ensure_ascii=False)
                f.write("\n")
            self.refresh_event_choices()
            self.clear_form()
        except Exception as exc:
            messagebox.showerror("Could not delete event", str(exc))

    def reload(self):
        self.load_events()
        self.refresh_event_choices()
        self.clear_form()


if __name__ == "__main__":
    root = tk.Tk()
    app = EventManager(root)
    root.mainloop()
