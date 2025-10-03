import os
import random
import argparse
from pathlib import Path

def rename_jpg_files_to_fall_themes(folder_path, prefix=None):
    """
    Renames JPG files in a folder to Fall-themed words, keeping pairs together.
    Files like IMG_0046.jpg and IMG_0046-min.jpg will become autumn.jpg and autumn-min.jpg
    
    Args:
        folder_path: Path to the folder containing JPG files
        prefix: Optional prefix to add before the fall word (e.g., "moody" -> "moody-autumn.jpg")
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
    word_counter = {}  # Track how many times each word has been used
    
    for i, (base_name, files) in enumerate(file_groups.items()):
        # Pop a word from the list if available
        if fall_words:
            fall_word = fall_words.pop(0)
        else:
            # If we run out of words, reuse from the beginning with numbered suffix
            # Use the original shuffled order
            base_word = list(word_counter.keys())[i % len(word_counter)] if word_counter else "autumn"
            word_counter[base_word] = word_counter.get(base_word, 1) + 1
            fall_word = f"{base_word}_{word_counter[base_word]}"
        
        # Track used words
        if '_' not in fall_word:  # Only track base words
            word_counter[fall_word] = word_counter.get(fall_word, 0)
        
        # Add prefix if provided
        if prefix:
            final_name = f"{prefix}-{fall_word}"
        else:
            final_name = fall_word
        
        print(f"\nGroup '{base_name}' -> '{final_name}':")
        
        # Rename all files in the group
        for file_path, suffix in files:
            # Create new filename
            new_name = f"{final_name}{suffix}.jpg"
            new_path = folder / new_name
            
            # Handle name conflicts (shouldn't happen now, but just in case)
            counter = 1
            while new_path.exists() and new_path != file_path:
                new_name = f"{fall_word}{suffix}_conflict{counter}.jpg"
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
    if len(file_groups) > 36:
        print(f"Note: Had {len(file_groups)} groups but only 36 unique words. Some names have numbered suffixes.")


# Example usage
if __name__ == "__main__":
    # Set up command line argument parser
    parser = argparse.ArgumentParser(
        description='Rename JPG files to Fall-themed names',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python script.py ./photos
  python script.py ./photos --prefix moody
  python script.py ./photos -p joyful
        '''
    )
    
    parser.add_argument(
        'folder',
        help='Path to the folder containing JPG files'
    )
    
    parser.add_argument(
        '-p', '--prefix',
        help='Optional prefix to add before fall words (e.g., "moody" creates "moody-autumn.jpg")',
        default=None
    )
    
    args = parser.parse_args()
    
    # Run the renaming function
    rename_jpg_files_to_fall_themes(args.folder, args.prefix)