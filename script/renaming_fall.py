import os
import random
from pathlib import Path

def rename_jpg_files_to_fall_themes(folder_path):
    """
    Renames JPG files in a folder to Fall-themed words, keeping pairs together.
    Files like IMG_0046.jpg and IMG_0046-min.jpg will become autumn.jpg and autumn-min.jpg
    
    Args:
        folder_path: Path to the folder containing JPG files
    """
    # Fall-themed words (lowercase)
    fall_words = [
        "autumn", "harvest", "pumpkin", "maple", "crisp", "cozy",
        "scarecrow", "hayride", "cider", "bonfire", "sweater", "leaves",
        "orange", "golden", "acorn", "squash", "gourd", "chilly",
        "october", "november", "rustic", "foliage", "cranberry", "nutmeg",
        "cinnamon", "plaid", "corn", "woods", "orchard", "spice",
        "amber", "bronze", "chestnut", "copper", "warm", "woodland"
    ]
    
    # Convert to Path object
    folder = Path(folder_path)
    
    # Check if folder exists
    if not folder.exists():
        print(f"Error: Folder '{folder_path}' does not exist.")
        return
    
    # Get all JPG files (case-insensitive)
    jpg_files = []
    for ext in ['*.jpg', '*.jpeg', '*.JPG', '*.JPEG']:
        jpg_files.extend(folder.glob(ext))
    
    if not jpg_files:
        print(f"No JPG files found in '{folder_path}'")
        return
    
    # Group files by base name (without -min suffix)
    file_groups = {}
    for file_path in jpg_files:
        stem = file_path.stem  # filename without extension
        
        # Check if it's a -min file
        if stem.endswith('-min'):
            base_name = stem[:-4]  # Remove '-min'
            suffix = '-min'
        else:
            base_name = stem
            suffix = ''
        
        # Group files with same base name
        if base_name not in file_groups:
            file_groups[base_name] = []
        file_groups[base_name].append((file_path, suffix))
    
    # Shuffle fall words for variety
    random.shuffle(fall_words)
    
    # Rename file groups
    renamed_count = 0
    for i, (base_name, files) in enumerate(file_groups.items()):
        # Use modulo to cycle through words if more groups than words
        word_index = i % len(fall_words)
        fall_word = fall_words[word_index]
        
        print(f"\nGroup '{base_name}' -> '{fall_word}':")
        
        # Rename all files in the group
        for file_path, suffix in files:
            # Create new filename
            new_name = f"{fall_word}{suffix}.jpg"
            new_path = folder / new_name
            
            # Handle name conflicts
            counter = 1
            while new_path.exists() and new_path != file_path:
                new_name = f"{fall_word}{suffix}_{counter}.jpg"
                new_path = folder / new_name
                counter += 1
            
            # Rename the file
            try:
                file_path.rename(new_path)
                print(f"  Renamed: {file_path.name} -> {new_name}")
                renamed_count += 1
            except Exception as e:
                print(f"  Error renaming {file_path.name}: {e}")
    
    print(f"\nCompleted! Renamed {renamed_count} files in {len(file_groups)} groups.")


# Example usage
if __name__ == "__main__":
    # Replace with your folder path
    folder_path = "../assets/wallpapers/fall"  # Current directory's 'photos' folder
    
    # Or use absolute path:
    # folder_path = "/path/to/your/folder"
    
    rename_jpg_files_to_fall_themes(folder_path)