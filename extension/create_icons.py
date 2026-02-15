import os
import sys

def create_placeholder_icon(filename, size):
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("Pillow (PIL) not found. Generating a basic Bitmap without text.")
        # If pillow is not installed, we can just create a solid blue square using simple bytes if needed,
        # but let's assume user likely has PIL or we can install it.
        # Fallback to no-dependency PPM format if user doesn't have PIL, then convert? No, that's complex for Windows.
        # Let's try to output a very simple BMP file manually if PIL fails.
        create_simple_bmp(filename, size)
        return

    img = Image.new('RGB', (size, size), color = (29, 161, 242)) # Twitter Blue
    d = ImageDraw.Draw(img)
    # Draw a simple 't' or bird shape approximation
    # Just a white square in the middle for now
    padding = size // 4
    d.rectangle([padding, padding, size-padding, size-padding], fill=(255,255,255))
    
    img.save(filename)
    print(f"Created {filename}")

def create_simple_bmp(filename, size):
    # Minimal BMP header for a blue square
    # This is a fallback if PIL is missing
    # 24-bit bitmap
    # File Header (14 bytes) + DIB Header (40 bytes) + Pixel Data
    # 3 bytes per pixel (BGR)
    
    width = size
    height = size
    row_padding = (4 - (width * 3) % 4) % 4
    pixel_data_size = (width * 3 + row_padding) * height
    file_size = 54 + pixel_data_size
    
    # Header
    bmp = bytearray()
    bmp.extend(b'BM')
    bmp.extend(file_size.to_bytes(4, 'little'))
    bmp.extend(b'\x00\x00') # reserved
    bmp.extend(b'\x00\x00') # reserved
    bmp.extend(b'\x36\x00\x00\x00') # offset to pixel data (54)
    
    # DIB Header
    bmp.extend(b'\x28\x00\x00\x00') # header size (40)
    bmp.extend(width.to_bytes(4, 'little'))
    bmp.extend(height.to_bytes(4, 'little'))
    bmp.extend(b'\x01\x00') # planes
    bmp.extend(b'\x18\x00') # bits per pixel (24)
    bmp.extend(b'\x00\x00\x00\x00') # compression (none)
    bmp.extend(pixel_data_size.to_bytes(4, 'little')) # image size
    bmp.extend(b'\x13\x0B\x00\x00') # x pixels per meter (2835)
    bmp.extend(b'\x13\x0B\x00\x00') # y pixels per meter (2835)
    bmp.extend(b'\x00\x00\x00\x00') # total colors
    bmp.extend(b'\x00\x00\x00\x00') # important colors
    
    # Pixel Data (BGR format, bottom-up)
    # Twitter Blue: #1DA1F2 -> BGR: F2 A1 1D
    blue_pixel = b'\xF2\xA1\x1D'
    row = blue_pixel * width + b'\x00' * row_padding
    
    for _ in range(height):
        bmp.extend(row)
        
    with open(filename.replace('.png', '.bmp'), 'wb') as f:
        f.write(bmp)
    print(f"Created {filename.replace('.png', '.bmp')} (PIL missing, use this BMP)")

if __name__ == "__main__":
    create_placeholder_icon("icon48.png", 48)
    create_placeholder_icon("icon128.png", 128)
