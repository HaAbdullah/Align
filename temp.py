import os
import shutil

# Path to your folder
folder_path = r"C:\Users\abdul\All\screenshot-analyzer\test-cases"

# Target number of images
target_count = 100

# Get list of images
images = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]

current_count = len(images)
if current_count == 0:
    raise ValueError("No images found in the folder!")

# Duplicate until we reach target_count
idx = 0
while len(images) < target_count:
    original_file = os.path.join(folder_path, images[idx % current_count])
    name, ext = os.path.splitext(images[idx % current_count])
    new_file = os.path.join(folder_path, f"{name}_copy{idx}{ext}")
    
    shutil.copy2(original_file, new_file)
    images.append(os.path.basename(new_file))
    idx += 1

print(f"Done! Folder now has {len(images)} images.")
