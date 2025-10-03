import os
import json

# --- CONFIGURATION ---
# The path where your image collection folders are located (relative to the script)
WALLPAPER_ROOT_DIR = "../assets/wallpapers"
# The output directory for the JSON file
OUTPUT_DIR = "../data"
# The name of the output JSON file
OUTPUT_JSON_FILE = "gallery_data.json"
# The default fallback image path for the browser
FALLBACK_IMAGE_PATH = "/portfolio/assets/no_image.png"

# --- JSON STRUCTURE ---
# We will create a list of collections, where each collection holds its images.
# Example:
# [
#   {"collection_name": "Cityscapes", "images": [...]},
#   {"collection_name": "Nature", "images": [...]}
# ]

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Full path to the JSON file
json_file_path = os.path.join(OUTPUT_DIR, OUTPUT_JSON_FILE)

# Load existing gallery data if the file exists
existing_collections = {}
if os.path.exists(json_file_path):
    try:
        with open(json_file_path, 'r') as f:
            existing_data = json.load(f)
            # Create a dictionary for easy lookup by collection name
            for collection in existing_data:
                existing_collections[collection['collection_name']] = collection
        print(f"Loaded existing data with {len(existing_collections)} collections.")
    except json.JSONDecodeError:
        print("Warning: Existing JSON file is invalid. Starting fresh.")
        existing_collections = {}
else:
    print("No existing JSON file found. Creating new one.")

gallery_data = []

# Iterate through every item in the root directory
for item_name in os.listdir(WALLPAPER_ROOT_DIR):
    # Construct the full path to the item (which should be a collection folder)
    collection_path = os.path.join(WALLPAPER_ROOT_DIR, item_name)
    
    # We only care about directories (folders)
    if os.path.isdir(collection_path):
        
        collection_name = item_name # Use folder name as collection name
        collection_images = []
        
        # First, group files by their base name (without -min suffix)
        file_groups = {}
        
        for file_name in os.listdir(collection_path):
            # Check for common image extensions (case-insensitive)
            if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                # Get the filename without extension
                name_without_ext = os.path.splitext(file_name)[0]
                extension = os.path.splitext(file_name)[1]
                
                # Check if it's a -min file
                if name_without_ext.endswith('-min'):
                    base_name = name_without_ext[:-4]  # Remove '-min'
                    file_type = 'min'
                else:
                    base_name = name_without_ext
                    file_type = 'full'
                
                # Group files with same base name
                if base_name not in file_groups:
                    file_groups[base_name] = {'min': None, 'full': None, 'extension': extension}
                
                file_groups[base_name][file_type] = file_name
        
        # Now process each group
        for base_name, files in file_groups.items():
            min_file = files['min']
            full_file = files['full']
            extension = files['extension']
            
            # Create the paths
            if min_file and full_file:
                # Both files exist - use min for display, full for download
                image_url = f"/portfolio/{WALLPAPER_ROOT_DIR}/{collection_name}/{min_file}"
                download_url = f"/portfolio/{WALLPAPER_ROOT_DIR}/{collection_name}/{full_file}"
            elif min_file:
                # Only min file exists - use it for both
                image_url = f"/portfolio/{WALLPAPER_ROOT_DIR}/{collection_name}/{min_file}"
                download_url = image_url
            elif full_file:
                # Only full file exists - use it for both
                image_url = f"/portfolio/{WALLPAPER_ROOT_DIR}/{collection_name}/{full_file}"
                download_url = image_url
            else:
                # Skip if no files (shouldn't happen)
                continue
            
            # Simple way to generate a title from the base name
            title = base_name.replace('-', ' ').replace('_', ' ').title()
            
            # Add image data to the collection list
            collection_images.append({
                "title": title,
                "filename": full_file if full_file else min_file,
                "alt": f"{title} - {collection_name}",
                "image_path": image_url,
                "download_path": download_url,
                "fallback_path": FALLBACK_IMAGE_PATH
            })
        
        # If the folder contained images, add the collection to the main data
        if collection_images:
            gallery_data.append({
                "collection_name": collection_name,
                "images": collection_images
            })
            print(f"  Processed collection: {collection_name} ({len(collection_images)} images)")

# Add back any existing collections that weren't found in the current scan
for collection_name, collection_data in existing_collections.items():
    # Check if this collection is already in our new data
    if not any(c['collection_name'] == collection_name for c in gallery_data):
        gallery_data.append(collection_data)
        print(f"  Kept existing collection: {collection_name} ({len(collection_data['images'])} images)")

# Write the final data to the JSON file
with open(json_file_path, 'w') as f:
    json.dump(gallery_data, f, indent=2)

print(f"\n✓ Successfully generated {len(gallery_data)} collections into {json_file_path}")
print(f"✓ Total images: {sum(len(collection['images']) for collection in gallery_data)}")