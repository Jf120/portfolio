"""Generate data/gallery_data.json from assets/wallpapers collections."""

import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
WALLPAPER_ROOT_DIR = REPO_ROOT / "assets" / "wallpapers"
OUTPUT_JSON_PATH = REPO_ROOT / "data" / "gallery_data.json"
FALLBACK_IMAGE_PATH = "./assets/no_image.png"
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def build_gallery_data() -> list[dict]:
    OUTPUT_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)

    existing_order: list[str] = []
    existing_collections: dict[str, dict] = {}
    if OUTPUT_JSON_PATH.exists():
        try:
            existing_data = json.loads(OUTPUT_JSON_PATH.read_text(encoding="utf-8"))
            for collection in existing_data:
                name = collection["collection_name"]
                existing_order.append(name)
                existing_collections[name] = collection
            print(f"Loaded existing data with {len(existing_collections)} collections.")
        except (json.JSONDecodeError, KeyError):
            print("Warning: Existing JSON file is invalid. Starting fresh.")

    discovered: dict[str, dict] = {}

    if WALLPAPER_ROOT_DIR.exists():
        for collection_dir in sorted(WALLPAPER_ROOT_DIR.iterdir()):
            if not collection_dir.is_dir():
                continue

            collection_name = collection_dir.name
            file_groups: dict[str, dict[str, str | None]] = {}

            for file_path in sorted(collection_dir.iterdir()):
                if not file_path.is_file() or file_path.suffix.lower() not in IMAGE_EXTENSIONS:
                    continue

                stem = file_path.stem
                if stem.endswith("-min"):
                    base_name = stem[:-4]
                    file_type = "min"
                else:
                    base_name = stem
                    file_type = "full"

                if base_name not in file_groups:
                    file_groups[base_name] = {"min": None, "full": None}
                file_groups[base_name][file_type] = file_path.name

            collection_images: list[dict[str, str]] = []
            for base_name, files in file_groups.items():
                min_file = files["min"]
                full_file = files["full"]

                if min_file and full_file:
                    image_url = f"./assets/wallpapers/{collection_name}/{min_file}"
                    download_url = f"./assets/wallpapers/{collection_name}/{full_file}"
                elif min_file:
                    image_url = f"./assets/wallpapers/{collection_name}/{min_file}"
                    download_url = image_url
                elif full_file:
                    image_url = f"./assets/wallpapers/{collection_name}/{full_file}"
                    download_url = image_url
                else:
                    continue

                title = base_name.replace("-", " ").replace("_", " ").title()
                collection_images.append(
                    {
                        "title": title,
                        "filename": full_file if full_file else min_file,
                        "alt": f"{title} - {collection_name}",
                        "image_path": image_url,
                        "download_path": download_url,
                        "fallback_path": FALLBACK_IMAGE_PATH,
                    }
                )

            if collection_images:
                discovered[collection_name] = {
                    "collection_name": collection_name,
                    "images": collection_images,
                }
                print(f"  Processed collection: {collection_name} ({len(collection_images)} images)")

    # Preserve existing collection order first, then append newly discovered folders.
    ordered_names = [name for name in existing_order if name in discovered or name in existing_collections]
    for name in discovered:
        if name not in ordered_names:
            ordered_names.append(name)

    gallery_data = [
        discovered.get(name, existing_collections.get(name))
        for name in ordered_names
        if name in discovered or name in existing_collections
    ]

    OUTPUT_JSON_PATH.write_text(json.dumps(gallery_data, indent=2) + "\n", encoding="utf-8")
    total_images = sum(len(collection["images"]) for collection in gallery_data)
    print(f"\n✓ Successfully generated {len(gallery_data)} collections into {OUTPUT_JSON_PATH}")
    print(f"✓ Total images: {total_images}")
    return gallery_data


if __name__ == "__main__":
    build_gallery_data()