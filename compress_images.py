import os
from PIL import Image

input_dir = 'images/gallery'
output_dir = 'images/gallery-thumbs'
os.makedirs(output_dir, exist_ok=True)

# Thumbnail dimensions
max_width = 800

for filename in os.listdir(input_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        img_path = os.path.join(input_dir, filename)
        out_path = os.path.join(output_dir, filename)
        
        try:
            with Image.open(img_path) as img:
                # Calculate new height to maintain aspect ratio
                w, h = img.size
                if w > max_width:
                    new_h = int((max_width / w) * h)
                    img = img.resize((max_width, new_h), Image.Resampling.LANCZOS)
                
                # Convert RGBA to RGB for JPEG if needed
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    bg = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'RGBA':
                        bg.paste(img, mask=img.split()[3])
                    else:
                        bg.paste(img)
                    img = bg
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                    
                img.save(out_path, 'JPEG', quality=75, optimize=True)
                print(f"Compressed {filename}")
        except Exception as e:
            print(f"Error compressing {filename}: {e}")

